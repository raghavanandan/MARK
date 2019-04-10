import React, {Component} from 'react';
import {Route, withRouter} from 'react-router-dom';
// import {Redirect} from 'react-router';
import Navbar from './components/Navbar';
import SideNavbar from './components/SideNavbar';
import MainLayout from './components/MainLayout';
import WorkspaceLayout from './components/WorkspaceLayout';
import './App.css';

// import DatasetTable from "./components/DatasetTable";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            section: '',
            redirect: false
        }

        this.handleSectionChange = this.handleSectionChange.bind(this);
    }

    handleSectionChange(section) {
        this.props.history.push({
            pathname: `/${section}`
        });
    }

    componentDidMount() {
        // console.log(this.props.history.location.pathname);
        if (this.props.history.location.pathname === '/') {
            this.setState({redirect: true});
        }
    }

    render() {

        return (
            <div>
                <Navbar/>
                <div className={"col-xs-12 main-layout fluid-container"}>
                    <div className={"col-md-2 side-navbar-div"}>
                        <SideNavbar section={this.handleSectionChange}/>
                    </div>
                    <div className={"col-md-10 container-div"}>
                        <Route exact path={"/home"} render={(props) => <MainLayout {...props} section={"home"}/>}/>
                        <Route exact path={"/experiments"} render={(props) => <MainLayout {...props} section={"experimentlist"}/>}/>
                            <Route exact path={"/experiments/:expId"} render={(props) => <WorkspaceLayout {...props} />}/>
                        <Route exact path={"/datasets"}
                               render={(props) => <MainLayout {...props} section={"datasets"}/>}/>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(App);
