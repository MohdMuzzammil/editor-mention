import React from 'react';
import PropTypes from 'prop-types';
import getOffset from '../utils/getOffset';

export default class SuggestionPortal extends React.Component {
  static propTypes = {
    offsetKey: PropTypes.any,
    mentionStore: PropTypes.object,
    decoratedText: PropTypes.string,
    children: PropTypes.any,
    callbacks: PropTypes.any,
    suggestionRegex: PropTypes.any,
  }
  componentWillMount() {
    const { callbacks, suggestionRegex, decoratedText } = this.props;
    const matches = suggestionRegex.exec(decoratedText);
    this.trigger = matches[2];
    this.updatePortalPosition(this.props);
    callbacks.setEditorState(callbacks.getEditorState());
  }
  componentWillReceiveProps(nextProps) {
    this.updatePortalPosition(nextProps);
  }
  componentWillUnmount() {
    const { offsetKey, mentionStore } = this.props;
    mentionStore.inActiveSuggestion({ offsetKey });
  }
  updatePortalPosition(props) {
    const { offsetKey, mentionStore } = props;
    mentionStore.updateSuggestion({
      offsetKey,
      trigger: this.trigger,
      position: () => {
        const element = this.searchPortal;
        const rect = getOffset(element);
        return {
          left: rect.left,
          top: rect.top,
          width: element.offsetWidth,
          height: element.offsetHeight,
        };
      },
    });
  }
  render() {
    return (
      <span ref={(node) => { this.searchPortal = node; }} style={this.props.style}>
        {this.props.children}
      </span>
    );
  }
}
