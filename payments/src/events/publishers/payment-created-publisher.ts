import { Subjects, Publisher, PaymentCreatedEvent } from '@bwebtickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
