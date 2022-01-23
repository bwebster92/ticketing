import { Publisher, Subjects, TicketUpdatedEvent } from '@bwebtickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
