import {guidGenerator} from './mediator-utils';

export default class Subscriber {

  id;
  fn;
  options;
  context;
  channel;

  constructor(fn, options, context) {
    this.id = guidGenerator();
    this.fn = fn;
    this.options = options;
    this.context = context;
    this.channel = null;
  }

  update(options) {
    if (options) {
      this.fn = options.fn || this.fn;
      this.context = options.context || this.context;
      this.options = options.options || this.options;
      if (this.channel && this.options && this.options.priority !== undefined) {
        this.channel.setPriority(this.id, this.options.priority);
      }
    }
  }
}