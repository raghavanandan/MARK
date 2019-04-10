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
                <li className={"side-navlinks " + (this.state.section === 'home' ? 'active' : '')} onClick={() => this.handleSectionChange('home')}>Home</li>
                <li className={"side-navlinks " + (this.state.section === 'experiments' ? 'active' : '')} onClick={() => this.handleSectionChange('experiments')}>Experiments</li>
                {/*<li className={"side-navlinks " + (this.state.section === 'file-structure' ? 'active' : '') } onClick={() => this.handleSectionChange('file-structure')}>File Structure</li>*/}
                <li className={"side-navlinks " + (this.state.section === 'datasets' ? 'active' : '')} onClick={() => this.handleSectionChange('datasets')}>Datasets</li>
            </div>
        );
    }
}

export default SideNavbar;