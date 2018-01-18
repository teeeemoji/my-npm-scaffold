import _ from 'lodash';
import Subscriber from './subscriber';
import {concatNamespace} from './mediator-utils';

export default class Channel {
  
  namespace;
  subscribers;
  channels;
  parent;
  stopped;
  
  constructor(namespace, parent) {
    this.namespace = namespace || '';
    this.subscribers = [];
    this.channels = {};
    this.parent = parent;
    this.stopped = false;
  }
  
  addSubscriber(fn, options, context) {
    let subscriber = new Subscriber(fn, options, context);
    
    // 带优先级 option 的, 做一些特殊处理
    if (options && options.priority !== undefined) {
      // Cheap hack to either parse as an int or turn it into 0. Runs faster
      // in many browsers than parseInt with the benefit that it won't
      // return a NaN.
      options.priority >>= 0;
      
      if (options.priority < 0) {
        options.priority = 0;
      }
      if (options.priority >= this.subscribers.length) {
        options.priority = this.subscribers.length - 1;
      }
      
      this.subscribers.splice(options.priority, 0, subscriber);
    } else { //不带优先级的, 直接推入队列
      this.subscribers.push(subscriber);
    }
    
    subscriber.channel = this;
    
    return subscriber;
  }
  
  getSubscriber(identifier) {
    let findSubIndex = _.findIndex(this.subscribers, subscriber =>
      subscriber.id === identifier || subscriber.fn === identifier
    );
    return this.subscribers[findSubIndex];
  }
  
  setPriority(identifier, priority) {
    let oldIndex = _.findIndex(
      this.subscribers,
      subscriber => subscriber.id === identifier
    );
    let subscriber = this.subscribers.splice(oldIndex, 1)[0];
    this.subscribers.splice(priority, 0, subscriber);
  }
  
  addChannel(channel) {
    this.channels[channel] = new Channel(
      concatNamespace(this.namespace, channel), this
    );
  }
  
  hasChannel(channel) {
    return this.channels.hasOwnProperty(channel);
  }
  
  returnChannel(channel) {
    return this.channels[channel];
  }
  
  removeSubscriber(identifier) {
    if (!identifier) {
      this.subscribers = [];
    } else {
      let subscriberIndex = _.findIndex(
        this.subscribers,
        subscriber => subscriber.id === identifier
      );
      this.subscribers.splice(subscriberIndex, 1, null);
    }
  }
  
  publish(data) {
    this.subscribers.map(
      (subscriber, index) => {
        if (this.subscribers[index] && !this.stopped) {
          let shouldCall = false;
          // 判断是否符合运行条件
          if (subscriber.options
            && typeof subscriber.options.predicate === 'function') {
            if (subscriber.options.predicate.apply(subscriber.context, data)) {
              shouldCall = true;
            }
          } else {
            shouldCall = true;
          }
          if (shouldCall) {
            subscriber.fn.apply(subscriber.context, data);
            if (subscriber.options && subscriber.options.calls !== undefined) {
              subscriber.options.calls--;
              if (subscriber.options.calls < 1) {
                this.removeSubscriber(subscriber.id);
              }
            }
          }
        }
      }
    );
    this.subscribers = _.compact(this.subscribers);
    if (this.parent) {
      this.parent.publish();
    }
    this.stopped = false;
    
  }
  
  stopPropagation() {
    this.stopped = true;
  }
}