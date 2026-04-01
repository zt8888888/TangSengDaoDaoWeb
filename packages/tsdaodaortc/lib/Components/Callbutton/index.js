import React, { Component } from "react";
import "./index.css";
export class CallButtonProps {
}
export class HangupButton extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { onClick } = this.props;
        return React.createElement("div", { className: "wk-call-btn" },
            React.createElement("button", { className: "hangup", onClick: () => {
                    if (onClick) {
                        onClick();
                    }
                } },
                React.createElement("img", { src: require('./assets/hangup.png'), alt: "" })),
            React.createElement("div", { className: "label" }, "\u6302\u65AD"));
    }
}
export class AnswerButton extends Component {
    render() {
        const { onClick } = this.props;
        return React.createElement("div", { className: "wk-call-btn" },
            React.createElement("button", { className: "answer", onClick: () => {
                    if (onClick) {
                        onClick();
                    }
                } },
                React.createElement("img", { src: require('./assets/answer.png'), alt: "" })),
            React.createElement("div", { className: "label" }, "\u63A5\u542C"));
    }
}
