import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { storage } from './server/storage.ts';
import { processVoiceInteraction } from './server/gemini.ts';
import { triggerBolnaCall } from './server/bolna.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// --- Health check ---
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    clinic: 'CareCall AI Virtual Receptionist',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// --- Departments ---
app.get('/api/departments', (_req: Request, res: Response) => {
  res.json(storage.getDepartments());
});

// --- Doctors ---
app.get('/api/doctors', (_req: Request, res: Response) => {
  res.json(storage.getDoctors());
});

app.post('/api/doctors', (req: Request, res: Response) => {
  try {
    const doctor = storage.addDoctor(req.body);
    res.status(201).json(doctor);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/doctors/:id', (req: Request, res: Response) => {
  const updated = storage.updateDoctor(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Doctor not found' });
    return;
  }
  res.json(updated);
});

// --- Appointments ---
app.get('/api/appointments', (_req: Request, res: Response) => {
  res.json(storage.getAppointments());
});

app.post('/api/appointments', (req: Request, res: Response) => {
  try {
    const { patientName, patientPhone, doctorId, date, timeSlot } = req.body;
    if (!patientName || !patientPhone || !doctorId || !date || !timeSlot) {
      res.status(400).json({ error: 'Missing required appointment fields (name, phone, doctor, date, slot)' });
      return;
    }

    const doctor = storage.getDoctorById(doctorId);
    const appointment = storage.createAppointment({
      ...req.body,
      doctorName: req.body.doctorName || doctor?.name || 'Assigned Doctor',
      department: req.body.department || doctor?.departmentName || 'General',
      status: req.body.status || 'confirmed',
      type: req.body.type || 'in_person',
      notes: req.body.notes || 'Booked via CareCall',
      bookedVia: req.body.bookedVia || 'web_portal',
      patientEmail: req.body.patientEmail || '',
    });

    res.status(201).json(appointment);
  } catch (err: any) {
    res.status(409).json({ error: err.message });
  }
});

app.put('/api/appointments/:id', (req: Request, res: Response) => {
  try {
    const updated = storage.updateAppointment(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(409).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', (req: Request, res: Response) => {
  const reason = (req.query.reason as string) || 'Cancelled by clinic';
  const cancelled = storage.cancelAppointment(req.params.id, reason);
  if (!cancelled) {
    res.status(404).json({ error: 'Appointment not found' });
    return;
  }
  res.json(cancelled);
});

// --- Patients ---
app.get('/api/patients', (_req: Request, res: Response) => {
  res.json(storage.getPatients());
});

app.post('/api/patients', (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) {
      res.status(400).json({ error: 'Name and phone are required' });
      return;
    }
    const created = storage.addPatient(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Calls & Transcripts ---
app.get('/api/calls', (_req: Request, res: Response) => {
  res.json(storage.getCalls());
});

app.get('/api/calls/:id', (req: Request, res: Response) => {
  const call = storage.getCallById(req.params.id);
  if (!call) {
    res.status(404).json({ error: 'Call log not found' });
    return;
  }
  res.json(call);
});

app.post('/api/calls', (req: Request, res: Response) => {
  try {
    const newCall = storage.addCall({
      ...req.body,
      id: req.body.id || `CALL-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: req.body.timestamp || new Date().toISOString(),
    });
    res.status(201).json(newCall);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Reminders ---
app.get('/api/reminders', (_req: Request, res: Response) => {
  res.json(storage.getReminders());
});

app.post('/api/reminders/trigger', async (req: Request, res: Response) => {
  const { reminderId, patientPhone, patientName, doctorName, appointmentDate, appointmentTime, appointmentId } = req.body;

  try {
    const bolnaResult = await triggerBolnaCall({
      recipientPhoneNumber: patientPhone,
      patientName,
      doctorName,
      appointmentDate,
      appointmentTime,
      appointmentId,
      callType: 'reminder',
    });

    if (reminderId) {
      storage.updateReminder(reminderId, {
        status: bolnaResult.success ? 'calling' : 'scheduled',
        lastContactedAt: new Date().toISOString(),
        patientResponse: bolnaResult.message,
      });
    }

    res.json(bolnaResult);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reminders/:id', (req: Request, res: Response) => {
  const updated = storage.updateReminder(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Reminder not found' });
    return;
  }
  res.json(updated);
});

// --- Escalations ---
app.get('/api/escalations', (_req: Request, res: Response) => {
  res.json(storage.getEscalations());
});

app.post('/api/escalations', (req: Request, res: Response) => {
  try {
    const esc = storage.createEscalation(req.body);
    res.status(201).json(esc);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/escalations/:id', (req: Request, res: Response) => {
  const updated = storage.updateEscalation(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Escalation not found' });
    return;
  }
  res.json(updated);
});

// --- Prescriptions ---
app.get('/api/prescriptions', (req: Request, res: Response) => {
  let prescriptions = storage.getPrescriptions();
  const { patientId, doctorId, appointmentId, phone, status, search } = req.query as Record<string, string>;

  if (patientId) {
    prescriptions = prescriptions.filter((p) => p.patientId === patientId);
  }
  if (doctorId) {
    prescriptions = prescriptions.filter((p) => p.doctorId === doctorId);
  }
  if (appointmentId) {
    prescriptions = prescriptions.filter((p) => p.appointmentId === appointmentId);
  }
  if (phone) {
    const clean = phone.replace(/\D/g, '');
    prescriptions = prescriptions.filter((p) => p.patientPhone.replace(/\D/g, '').includes(clean));
  }
  if (status && status !== 'all') {
    prescriptions = prescriptions.filter((p) => p.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    prescriptions = prescriptions.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.patientName.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.doctorName.toLowerCase().includes(q) ||
        p.doctorDepartment.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q)
    );
  }

  res.json(prescriptions);
});

app.get('/api/prescriptions/:id', (req: Request, res: Response) => {
  const rx = storage.getPrescriptionById(req.params.id);
  if (!rx) {
    res.status(404).json({ error: 'Prescription not found' });
    return;
  }
  res.json(rx);
});

app.post('/api/prescriptions', (req: Request, res: Response) => {
  try {
    const { patientName, doctorName, diagnosis, appointmentId } = req.body;
    if (!patientName) {
      res.status(400).json({ error: 'Patient name is required' });
      return;
    }
    // Check if appointment already has a prescription to prevent accidental duplicates
    if (appointmentId) {
      const existing = storage.getPrescriptionByAppointmentId(appointmentId);
      if (existing) {
        res.status(409).json({
          error: `An active prescription (#${existing.id}) already exists for appointment ${appointmentId}.`,
          existingPrescription: existing,
        });
        return;
      }
    }

    const created = storage.createPrescription(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/prescriptions/:id', (req: Request, res: Response) => {
  try {
    const { actorName = 'Doctor', actorRole = 'doctor', auditNotes, ...updates } = req.body;
    const updated = storage.updatePrescription(req.params.id, updates, actorName, actorRole, auditNotes);
    if (!updated) {
      res.status(404).json({ error: 'Prescription not found' });
      return;
    }
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/prescriptions/:id/approve', (req: Request, res: Response) => {
  try {
    const { doctorName, signatureText } = req.body;
    const existing = storage.getPrescriptionById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Prescription not found' });
      return;
    }

    const updated = storage.updatePrescription(
      req.params.id,
      {
        status: 'approved',
        authorizedDoctorName: doctorName || existing.doctorName,
        authorizedSignature: signatureText || `Digitally Verified: ${doctorName || existing.doctorName} [Reg: ${existing.doctorRegistrationNumber || 'MCI-REG'}]`,
      },
      doctorName || existing.doctorName,
      'doctor',
      'Prescription approved and authorized for patient release'
    );

    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/prescriptions/:id', (req: Request, res: Response) => {
  const success = storage.deletePrescription(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Prescription not found' });
    return;
  }
  res.json({ message: 'Prescription deleted successfully', id: req.params.id });
});

// --- Settings ---
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(storage.getSettings());
});

app.put('/api/settings', (req: Request, res: Response) => {
  const updated = storage.updateSettings(req.body);
  res.json(updated);
});

// --- Dashboard Statistics ---
app.get('/api/stats', (_req: Request, res: Response) => {
  res.json(storage.getStats());
});

// --- Database Reset (Demo convenience) ---
app.post('/api/database/reset', (_req: Request, res: Response) => {
  storage.resetDatabase();
  res.json({ message: 'Database reset to initial sample records successfully.' });
});

// --- Voice Interaction (Gemini 3.8 Flash + Voice Agent Logic) ---
app.post('/api/ai/voice-interaction', async (req: Request, res: Response) => {
  const { message, history = [], language = 'en', callerPhone = '+91 98765 43210' } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Message text is required' });
    return;
  }

  try {
    const aiResult = await processVoiceInteraction(message, history, language, callerPhone);

    // If AI decided to trigger an appointment booking, execute database write immediately
    let bookedAppointment = null;
    let bookingError = null;

    if (aiResult.action === 'book_appointment' && aiResult.actionData) {
      try {
        const { doctorId, date, timeSlot, patientName, patientPhone, reason, department } = aiResult.actionData;
        const targetDoctor = doctorId ? storage.getDoctorById(doctorId) : storage.getDoctors()[0];

        const finalDate = date || new Date().toISOString().split('T')[0];
        const finalSlot = timeSlot || '05:30 PM';
        const finalDocId = targetDoctor?.id || 'doc-priya-sharma';
        const finalDocName = targetDoctor?.name || 'Dr. Priya Sharma';
        const finalDept = department || targetDoctor?.departmentName || 'Dermatology';

        bookedAppointment = storage.createAppointment({
          patientName: patientName || 'Voice Caller',
          patientPhone: patientPhone || callerPhone,
          patientEmail: '',
          doctorId: finalDocId,
          doctorName: finalDocName,
          department: finalDept,
          date: finalDate,
          timeSlot: finalSlot,
          status: 'confirmed',
          type: 'in_person',
          notes: reason || 'Booked via AI Voice Receptionist natural conversation',
          bookedVia: 'ai_voice',
        });
      } catch (err: any) {
        bookingError = err.message;
        // Adjust reply to inform user politely about slot unavailability
        aiResult.reply += ` (Note: ${err.message})`;
      }
    }

    // If escalation triggered
    let createdEscalation = null;
    if (aiResult.action === 'escalate' || aiResult.escalation?.needed) {
      createdEscalation = storage.createEscalation({
        patientName: aiResult.actionData?.patientName || 'Voice Caller',
        patientPhone: callerPhone,
        urgency: aiResult.escalation?.urgency || 'high',
        reason: aiResult.escalation?.reason || 'Voice call escalated by AI assistant',
        status: 'pending',
        notes: `Caller message: "${message}"`,
      });
    }

    res.json({
      ...aiResult,
      bookedAppointment,
      bookingError,
      createdEscalation,
    });
  } catch (err: any) {
    console.error('Error in voice interaction API:', err);
    res.status(500).json({
      reply: 'I apologize, but I encountered a momentary connection glitch. Could you please repeat that?',
      language,
      detectedIntent: 'inquiry',
      action: 'none',
      error: err.message,
    });
  }
});

// --- Bolna AI Outbound Call Trigger ---
app.post('/api/bolna/call', async (req: Request, res: Response) => {
  try {
    const result = await triggerBolnaCall(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Vite Middleware in Development / Static Files in Production ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareCall server listening on port ${PORT}`);
  });
}

startServer();
