import React, {Component} from 'react';

class HomePage extends Component{
    constructor(props){
        super(props);
        this.state = {

        }
    }

    render() {
        return(
            <div className={"tab-layout"}>
                <legend>Home</legend>
                <p>Welcome !</p>
            </div>
        )
    }
}

export default HomePage;