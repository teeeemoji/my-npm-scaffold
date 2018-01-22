import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

const expect = chai.expect;

import {Mediator} from '../src';

describe('Mediator', function () {
  
  let mediator;
  
  beforeEach(function () {
    // 每个测试用例都从新 new 一个 Mediator 对象

    mediator = new Mediator();
  });
  
  describe('初始化...', function () {
    it('拥有 chennel 属性', function () {
      expect(mediator.getChannel()).not.to.be.undefined;
    });
  });
  
  describe('订阅事件 ->', function () {
    it('test 频道订阅一个事件', function () {
      let spy = sinon.spy();
      mediator.subscribe('test', spy);
      let testChannel = mediator.getChannel('test');
      expect(testChannel.subscribers.length).to.equal(1);
    });
    
    it('test 频道订阅两个不同事件', function () {
      let spy = sinon.spy();
      let spy2 = sinon.spy();
      mediator.subscribe('test', spy);
      mediator.subscribe('test', spy2);
      let testChannel = mediator.getChannel('test');
      expect(testChannel.subscribers.length).to.equal(2);
    });
    
    it('test 频道订阅两个同一事件', function () {
      let spy = sinon.spy();
      mediator.subscribe('test', spy);
      mediator.subscribe('test', spy);
      expect(mediator.getChannel('test').subscribers.length).to.equal(2);
    });
  });
  
  describe('options.calls 控制事件执行次数', function () {
    it('使用 once 方法订阅事件: 执行一次后被移出', function () {
      let spy = sinon.spy();
      mediator.once('test', spy);
      mediator.publish('test');
      mediator.publish('test');
      expect(mediator.getChannel('test').subscribers.length).to.equal(0);
      expect(spy).calledOnce;
    });
    
    it('通过 options.calls=3 订阅事件: 执行三次后被移出', function () {
      let spy = sinon.spy();
      let i;
      mediator.subscribe('test', spy, {calls: 3});
      
      for (i = 0; i < 5; i++) {
        mediator.publish('test');
      }
      expect(mediator.getChannel('test').subscribers.length).to.equal(0);
      expect(spy).calledThrice;
    });
    
    it('超过最大执行次数的时间, 会被移除', function () {
      let spy = sinon.spy();
      let i;
      mediator.subscribe('test', function () {
      });
      mediator.subscribe('test', spy, {calls: 3});
      mediator.subscribe('test', function () {
      });
      for (i = 0; i < 10; i++) {
        mediator.publish('test', 'test');
      }
      expect(mediator.getChannel('test').subscribers.length).to.equal(2);
      expect(spy).calledThrice;
    });
    
    it('事件执行过后,  它的 options.calls 会递减', function () {
      let spy = sinon.spy();
      let spy2 = sinon.spy();
      let subscriber1 = mediator.subscribe('test', spy, {
        calls: 3, predicate: function (d) {
          return (d === 1);
        }
      });
      let subscriber2 = mediator.subscribe('test', spy2, {
        calls: 3, predicate: function (d) {
          return (d === 2);
        }
      });
      
      mediator.publish('test', 1);
      mediator.publish('test', 2);
      
      expect(spy).calledOnce;
      expect(subscriber1.options.calls).to.equal(2);
      expect(subscriber2.options.calls).to.equal(2);
    });
  });
  
  describe('频道发布...', function () {
    it('向 publish 方法传入频道名, 触发所有订阅该频道的事件', function () {
      let spy = sinon.spy();
      
      mediator.subscribe('testX', spy);
      mediator.publish('testX');
      
      expect(spy).called;
    });
    
    it('某事件调用 stopPropagation 方法可以阻止它后面事件的执行', function () {
      let spy = sinon.spy();
      let spy2 = sinon.spy();
      let subscriber = function (c) {
        c.stopPropagation();
        spy();
      };
      let subscriber2 = function () {
        spy2();
      };
      
      mediator.subscribe('testX', subscriber);
      mediator.subscribe('testX', subscriber2);
      mediator.publish('testX');
      
      expect(spy).called;
      expect(spy2).not.called;
    });
    
    
    it('频道发布, 会触发所有订阅该频道的事件', function () {
      let spy = sinon.spy();
      let spy2 = sinon.spy();
      
      mediator.subscribe('test', spy);
      mediator.subscribe('test', spy2);
      mediator.publish('test');
      
      expect(spy).called;
      expect(spy2).called;
    });
    
    it('publish 向订阅的事件传入参数', function () {
      let spy = sinon.spy();
      let channel = 'test';
      let arg = 'arg1';
      let arg2 = 'arg2';
      
      mediator.subscribe(channel, spy);
      mediator.publish(channel, arg, arg2);
      
      expect(spy).calledWith(arg, arg2, mediator.getChannel(channel));
    });
    
    it('predicates 方法返回 true 的时候, 触发事件', function () {
      let spy = sinon.spy();
      let spy2 = sinon.spy();
      let spy3 = sinon.spy();
      
      let predicate = function (data) {
        return data.length === 4;
      };
      
      let predicate2 = function (data) {
        return data[0] === 'Y';
      };
      
      mediator.subscribe('test', spy, {predicate: predicate});
      mediator.subscribe('test', spy2, {predicate: predicate2});
      mediator.subscribe('test', spy3);
      
      mediator.publish('test', 'Test');
      
      expect(spy).called;
      expect(spy2).not.called;
      expect(spy3).called;
    });
    
  });
  
  describe('删除...', function () {
    it('删除 test 频道的所有订阅事件', function () {
      let spy = sinon.spy();
      
      mediator.subscribe('test', spy);
      mediator.remove('test');
      mediator.publish('test');
      
      expect(spy).not.called;
    });
    
    it('允许订阅的事件, 将自身从订阅事件列表移除', function () {
      let removerCalled = false;
      let predicate = function (data) {
        return true;
      };
      let remover = function () {
        removerCalled = true;
        mediator.remove('test', sub.id);
      };
      
      let spy1 = sinon.spy();
      
      let sub = mediator.subscribe('test', remover, {
        predicate: predicate,
        a: 'remover'
      });
      mediator.subscribe('test', spy1, {a: 'spy'});
      mediator.publish('test');
      
      expect(removerCalled).to.be.true;
      expect(spy1).called;
      expect(mediator.getChannel('test').subscribers.length).to.equal(1);
    });
    
    it('用同一方法订阅多次同一事件, 将会触发多次', function () {
      let spy = sinon.spy();
      let spy2 = sinon.spy();
      
      mediator.subscribe('test', spy);
      mediator.subscribe('test', spy2);
      mediator.subscribe('test', spy);
      mediator.subscribe('test', spy);
      mediator.subscribe('test', spy2);
      mediator.publish('test');
      
      expect(spy).calledThrice;
      expect(spy2).calledTwice;
    });
    
    it(
      'should remove subscribers by calling from subscriber\'s callback',
      function () {
        let spy = sinon.spy();
        let spy2 = sinon.spy();
        let catched = false;
        mediator.subscribe('test', function () {
          mediator.remove('test');
        });
        mediator.subscribe('test', spy);
        mediator.subscribe('test', spy2);
        try {
          mediator.publish('test');
        } catch (e) {
          catched = true;
        }
        expect(catched).to.be.false;
        expect(spy).not.called;
        expect(spy2).not.called;
      });
    
    it('should remove subscriber by calling from its callback', function () {
      let remover = function () {
        mediator.remove('test', sub.id);
      };
      let spy = sinon.spy();
      let spy2 = sinon.spy();
      let catched = false;
      let sub = mediator.subscribe('test', remover);
      mediator.subscribe('test', spy);
      mediator.subscribe('test', spy2);
      try {
        mediator.publish('test');
      } catch (e) {
        catched = true;
      }
      expect(catched).to.be.false;
      expect(spy).to.called;
      expect(spy2).to.called;
      remover = sinon.spy(remover);
      mediator.publish('test');
      expect(remover).not.to.called;
      expect(spy).to.called;
      expect(spy2).to.called;
    });
  });
  
  describe('updating', function () {
    it('should update subscriber by identifier', function () {
      let spy = sinon.spy();
      let newPredicate = function (data) {
        return data;
      };
      
      let sub = mediator.subscribe('test', spy);
      let subId = sub.id;
      
      let subThatIReallyGotLater = mediator.getSubscriber(subId, 'test');
      subThatIReallyGotLater.update({options: {predicate: newPredicate}});
      expect(subThatIReallyGotLater.options.predicate).to.equal(newPredicate);
    });
    
    it('should update subscriber priority by identifier', function () {
      let spy = sinon.spy();
      let spy2 = sinon.spy();
      let sub = mediator.subscribe('test', spy);
      let sub2 = mediator.subscribe('test', spy2);
      
      sub2.update({options: {priority: 0}});
      
      expect(mediator.getChannel('test').subscribers[0].id).to.equal(sub2.id);
      expect(mediator.getChannel('test').subscribers[1].id).to.equal(sub.id);
    });
    
    it('should update subscriber by fn', function () {
      let spy = sinon.spy();
      let newPredicate = function (data) {
        return data;
      };
      
      mediator.subscribe('test', spy);
      
      let subThatIReallyGotLater = mediator.getSubscriber(spy, 'test');
      subThatIReallyGotLater.update({options: {predicate: newPredicate}});
      expect(subThatIReallyGotLater.options.predicate).to.equal(newPredicate);
    });
  });
  
  describe('namespaces', function () {
    it('should make subchannels', function () {
      let spy = sinon.spy();
      mediator.subscribe('test:subchannel', spy);
      mediator.getChannel('test');
      expect(
        mediator.getChannel('test').channels['subchannel'].subscribers.length
      ).to.equal(1);
    });
    
    it(
      'should call all functions within a given channel namespace',
      function () {
        let spy = sinon.spy();
        let spy2 = sinon.spy();
        
        mediator.subscribe('test:channel', spy);
        mediator.subscribe('test', spy2);
        
        mediator.publish('test:channel');
        
        expect(spy).called;
        expect(spy2).called;
      });
    
    it(
      'should call only functions within a given channel namespace',
      function () {
        let spy = sinon.spy();
        let spy2 = sinon.spy();
        
        mediator.subscribe('test', spy);
        mediator.subscribe('derp', spy2);
        
        mediator.publish('test');
        
        expect(spy).called;
        expect(spy2).not.called;
      });
    
    it('should remove functions within a given channel namespace', function () {
      let spy = sinon.spy();
      let spy2 = sinon.spy();
      
      mediator.subscribe('test:test1', spy);
      mediator.subscribe('test', spy2);
      mediator.remove('test:test1');
      mediator.publish('test:test1');
      
      expect(spy).not.called;
      expect(spy2).called;
    });
    
    it('should publish to specific namespaces', function () {
      let spy = sinon.spy();
      let spy2 = sinon.spy();
      
      mediator.subscribe('test:test1:test2', spy);
      mediator.subscribe('test', spy2);
      mediator.publish('test:test1', 'data');
      
      expect(spy).not.called;
      expect(spy2).called;
    });
    
    it('should publish to parents of non-existing namespaces', function () {
      let spy = sinon.spy();
      let spy2 = sinon.spy();
      
      mediator.subscribe('test:test1:test2', spy);
      mediator.subscribe('test', spy2);
      mediator.publish('test:test1', 'data');
      
      expect(spy).not.called;
      expect(spy2).called;
    });
    
  });
});