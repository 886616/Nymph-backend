import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ValueTransformer,
} from 'typeorm';
import { EVENT_CURRENCIES, EVENT_REGIONS } from '../../constants/event';

// MySQL returns DECIMAL as a string, convert it to a number for the API
const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value?: string | null) => (value === null || value === undefined ? value : parseFloat(value)),
};

@Entity('seminar_events')
export class SeminarEvent {
  // Readable slug used by the frontend, e.g. "ahmedabad-29-nov-2026"
  @PrimaryColumn({ type: 'varchar', length: 120 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'tinyint', unsigned: true })
  days: number;

  // DATE columns are returned as "YYYY-MM-DD" strings (dateStrings: true in db.ts)
  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'varchar', length: 50 })
  time: string;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ type: 'enum', enum: [...EVENT_REGIONS] })
  region: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  venueName: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  venueAddress: string | null;

  @Column({ type: 'enum', enum: [...EVENT_CURRENCIES] })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, transformer: decimalTransformer })
  groupPrice: number;

  @Column({ type: 'smallint', unsigned: true })
  groupMinSize: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy: string | null;

  @CreateDateColumn({ type: 'datetime' })
  createdOn: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  modifiedBy: string | null;

  @UpdateDateColumn({ type: 'datetime', nullable: true })
  modifiedOn: Date;
}
