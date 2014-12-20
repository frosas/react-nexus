module.exports = function(R) {
  const _ = R._;
  const ActionHandler = require('./R.Dispatcher.ActionHandler')(R);

  class Dispatcher {
    constructor(actionHandlers = {}) {
      _.dev(() => actionHandlers.should.be.an.Object &&
        Object.keys(actionHandlers).map((action) => action.should.be.a.String &&
          actionHandlers[action].should.be.a.Function
        )
      );
      this.actionHandlers = {};
      Object.keys(actionHandlers)
      .forEach((action) => this.addActionHandler(action, actionHandlers[action]));
    }

    destroy() {
      // Explicitly remove all action handlers
      Object.keys(this.actionHandlers).forEach((action) =>
        Object.keys(this.actionHandlers[action]).forEach((k) =>
          this.removeActionHandler(this.actionHandlers[action][k])
        )
      );
      // Nullify references
      this.actionHandlers = null;
    }

    addActionHandler(action, handler) {
      let actionListener = new ActionHandler(action, handler);
      actionListener.pushInto(this.actionHandlers);
      return actionListener;
    }

    removeActionHandler(actionListener) {
      _.dev(() => actionListener.should.be.instanceOf(ActionHandler) &&
        actionListener.isInside(this.actionHandlers).should.be.ok
      );
      actionListener.removeFrom(this.actionHandlers);
    }

    dispatch(action, params = {}) {
      _.dev(() => action.should.be.a.String &&
        params.should.be.an.Object
      );
      if(this.actionHandlers[action] === void 0) {
        return Promise.resolve(true);
      }
      return Promise.map(Object.keys(this.actionHandlers[action]), (key) => this.actionHandlers[action][key].dispatch(params));
    }
  }

  _.extend(Dispatcher.prototype, {
    actionHandlers: null,
  });

  _.extend(Dispatcher, { ActionHandler });

  const UplinkDispatcher = require('./R.Dispatcher.UplinkDispatcher')(R, Dispatcher);

  _.extend(Dispatcher, { UplinkDispatcher });

  return Dispatcher;
};
