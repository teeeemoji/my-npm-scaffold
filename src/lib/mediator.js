import Channel from './channel';

export default class Mediator {

  // 私有属性channel
  channels;

  constructor() {
    this.channels = new Channel('');
  }

  //
  getChannel(namespace = '', readOnly = true) {
    let channel = this.channels;
    let namespaceSplit = namespace.split(':');
    if (namespace === '') {
      return channel;
    }

    namespaceSplit.some(namesp => {
      if (!channel.hasChannel(namesp)) {
        if (readOnly) {
          return true;
        } else {
          channel.addChannel(namesp);
          return false;
        }
      }
      channel = channel.returnChannel(namesp);
    });

    return channel;
  }

  subscribe(channelName = '', fn, options = {}, context = {}) {
    let channel = this.getChannel(channelName, false);
    return channel.addSubscriber(fn, options, context);
  }

  once(channelName, fn, options = {}, context) {
    options.calls = 1;
    return this.subscribe(channelName, fn, options, context);
  }

  getSubscriber(identifier, channelName = '') {
    let channel = this.getChannel(channelName, true);
    if (channel.namespace !== channelName) {
      return null;
    }
    return channel.getSubscriber(identifier);
  }

  remove(channelName = '', identifier) {
    let channel = this.getChannel(channelName, true);
    if (channel.namespace !== channelName) {
      return false;
    }
    channel.removeSubscriber(identifier);
  }

  publish(channelName = '') {
    let channel = this.getChannel(channelName, true);
    if (channel.namespace !== channelName) {
      return null;
    }
    let args = Array.prototype.slice.call(arguments, 1);
    args.push(channel);
    channel.publish(args);
  }
}