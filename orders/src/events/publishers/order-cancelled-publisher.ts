import { Publisher, OrderCancelledEvent, Subjects } from '@bwebtickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
