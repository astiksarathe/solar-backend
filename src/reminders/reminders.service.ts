import { Injectable } from '@nestjs/common';
import { query } from '../db/pg.provider';
import { QueryResult } from 'pg';

type ReminderRow = {
  id: number;
  customer_id?: string;
  reminder_at: string;
  reminder_note?: string;
  reminder_type?: string;
  status: string;
  created_at: string;
};

@Injectable()
export class RemindersService {
  async create(
    customerId: string | undefined,
    payload: {
      reminder_at: string;
      reminder_note?: string;
      reminder_type?: string;
    },
  ) {
    const res: QueryResult<ReminderRow> = await query(
      'INSERT INTO reminders (customer_id, reminder_at, reminder_note, reminder_type, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, reminder_at, status, created_at',
      [
        customerId,
        payload.reminder_at,
        payload.reminder_note,
        payload.reminder_type,
        'pending',
      ],
    );
    return res.rows && res.rows[0];
  }

  async findPending() {
    const res: QueryResult<ReminderRow> = await query(
      'SELECT * FROM reminders WHERE status = $1',
      ['pending'],
    );
    return res.rows || [];
  }
}
