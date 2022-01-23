import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@bwebtickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
