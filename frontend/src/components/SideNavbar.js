import React, {Component} from 'react';

class SideNavbar extends Component{
    constructor(props){
        super(props);
        this.state = {
            section: ''
        };

        this.handleSectionChange = this.handleSectionChange.bind(this);
    }

    componentDidMount() {
        let url = window.location.href;
        url = url.split("/");
        this.setState({section: url.pop()});
    }

    handleSectionChange(section) {
        this.setState({section});
        this.props.section(section);
    }

    render() {
        return (
            <div className={'side-navbar'}>
                {/*<li className={"side-navlinks text-center " + (this.state.section === 'home' ? 'active' : '')} onClick={() => this.handleSectionChange('home')}>*/}
                {/*    <div className={"side-navlinks-icon"}>*/}
                {/*        <i className={"fas fa-home"} />*/}
                {/*    </div>*/}
                {/*    <div className={"side-navlinks-name"}>*/}
                {/*        Home*/}
                {/*    </div>*/}
                {/*</li>*/}
                <li className={"side-navlinks text-center " + (this.state.section === 'experiments' ? 'active' : '')} onClick={() => this.handleSectionChange('experiments')}>
                    <div className={"side-navlinks-icon"}>
                        <i className={"fas fa-flask"} />
                    </div>
                    <div className={"side-navlinks-name"}>
                        Experiments
                    </div>
                </li>
                <li className={"side-navlinks text-center " + (this.state.section === 'datasets' ? 'active' : '')} onClick={() => this.handleSectionChange('datasets')}>
                    <div className={"side-navlinks-icon"}>
                        <i className={"fas fa-database"} />
                    </div>
                    <div className={"side-navlinks-name"}>
                        Datasets
                    </div>
                </li>
                <li className={"side-navlinks text-center"}>
                    <div className={"side-navlinks-icon"}>
                        <i className={"fas fa-globe"} />
                    </div>
                    <div className={"side-navlinks-name"}>
                        Web Service
                    </div>
                </li>
            </div>
        );
    }
}

export default SideNavbar;