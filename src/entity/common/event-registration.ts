import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('event_registrations')
export class EventRegistration {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 120 })
  eventId: string;

  @Column({ type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  organisation: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  designation: string | null;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'smallint', unsigned: true })
  participants: number;

  @Column({ type: 'text', nullable: true })
  additionalParticipants: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'boolean', default: false })
  acceptedTerms: boolean;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  emailStatus: string;

  @Column({ type: 'datetime' })
  createdOn: Date;
}