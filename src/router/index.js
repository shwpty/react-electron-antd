import React, {Component} from 'react';
import {HashRouter as Router, Route, Routes} from "react-router-dom";
import ShowNode from "@/pages/home/index";
import HeaderNav from "@/components/HeaderNav";

class AppRouter extends Component {
    render() {
        return (
            <Router>
                <HeaderNav />
                <Routes>
                    <Route path={'/'} element={<ShowNode />} />
                </Routes>
            </Router>
        );
    }
}

export {AppRouter};