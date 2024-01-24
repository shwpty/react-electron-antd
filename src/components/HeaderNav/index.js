import React, {Component} from 'react';

class HeaderNav extends Component {
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">首页</a>
                </div>
            </nav>
        );
    }
}

export default HeaderNav;