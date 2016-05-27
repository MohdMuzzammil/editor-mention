import React from 'react';
import {Editor, EditorState, CompositeDecorator} from 'draft-js';
import { List } from 'immutable';

class EditorCore extends React.Component {
  constructor(props) {
    super(props);
    this.state = {editorState: EditorState.createEmpty()};
    this.focus = () => this.refs.editor.focus();
  }
  componentWillMount() {
    const compositeDecorator = new CompositeDecorator(
      this.getPlugins()
        .map(plugin => {
          plugin.callbacks.getEditorState = this.getEditorState.bind(this);
          plugin.callbacks.setEditorState = this.setEditorState.bind(this);
          return plugin;
        })
        .filter(plugin => plugin.decorators !== undefined)
        .map(plugin => plugin.decorators)
        .reduce((prev, curr) => prev.concat(curr))
    );

    this.onChange(EditorState.set(this.state.editorState, { decorator: compositeDecorator}));
  }
  getEditorState() {
    return this.state.editorState;
  }
  setEditorState(editorState) {
    this.props.onChange && this.props.onChange(editorState);
    this.setState({ editorState });
  }
  handleKeyBinding = (command) => {
    if (command === 'split-block') {
      return true;
    }
    return false;
  }
  getPlugins() {
    return this.props.plugins.slice();
  }
  onUpArrow = () => {
    const plugins = this.getPlugins();
    for (let i = 0; i < plugins.length; i++) {
      if (plugins.onUpArrow) {
        const result = plugins.onUpArrow.apply(this, arguments);
        if (result === true) {
          return true;
        }
      }
    }
    return false;
  }
  onChange = (editorState) => {
    let newEditorState = editorState;
    this.getPlugins().forEach(plugin => {
      if (plugin.onChange) {
        newEditorState = plugin.onChange(editorState);
      }
    });
    this.setEditorState(editorState);
  }
  generatorEventHandler(eventName) {
    const plugins = this.getPlugins();
    return (...args) => {
      for (let i = 0; i < plugins.length; i++) {
        const plugin = plugins[i];
        if (plugin.callbacks[eventName] && typeof plugin.callbacks[eventName] === 'function') {
          const result = plugin.callbacks[eventName](...args);
          if (result === true) {
            return true;
          }
        }
      }
      return false;
    }
  }
  getEventHandler() {
    const enabledEvents = ['onUpArrow', 'onDownArrow', 'handleReturn'];
    const eventHandler = {};
    enabledEvents.forEach( event => {
      eventHandler[event] = this.generatorEventHandler(event);
    });
    return eventHandler;
  }
  render() {
    const { prefixCls } = this.props;
    const { editorState } = this.state;
    const eventHandler = this.getEventHandler();
    return (<div onClick={this.focus}>
      <Editor
        {...eventHandler}
        className={`${prefixCls}-editor`}
        ref="editor"
        editorState={editorState}
        handleKeyCommand={this.handleKeyBinding}
        onChange={this.onChange}
      />
    </div>);
  }
}

EditorCore.defaultProps = {
  plugins: [],
};

export default EditorCore;