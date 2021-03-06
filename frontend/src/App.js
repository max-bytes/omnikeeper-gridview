import './App.css';
import 'antd/dist/antd.css';
import { Menu } from 'antd';
import { BrowserRouter, Switch, Route, Link } from 'react-router-dom'
import LoginPage from './components/LoginPage'
import UserBar from './components/UserBar';
import Keycloak from 'keycloak-js';
import ApolloWrapper from './components/ApolloWrapper';
import env from "@beam-australia/react-env";
import { ReactKeycloakProvider } from '@react-keycloak/web';
import { PrivateRoute } from './components/PrivateRoute';
import useGridViewPluginManager from "utils/useGridViewPluginManager";

const keycloak = new Keycloak({
    "realm": env("KEYCLOAK_REALM"),
    "url": env("KEYCLOAK_URL"),
    "ssl-required": "none",
    "resource": env("KEYCLOAK_RESOURCE"),
    "clientId": env("KEYCLOAK_CLIENT_ID"),
    "public-client": true,
    "verify-token-audience": true,
    "use-resource-role-mappings": true,
    "confidential-port": 0,
    "enable-cors": true
})

const keycloakProviderInitOptions = {
    // workaround, disabling of checking iframe cookie, because its a cross-site one, and chrome stopped accepting them
    // when they don't have SameSite=None set... and keycloak doesn't send a proper cookie yet: 
    // https://issues.redhat.com/browse/KEYCLOAK-12125
    "checkLoginIframe": false,
    onLoad: 'check-sso',
    // promiseType: 'native'
}

function App() {
    const { data: gridviewPluginManager, loading: gridviewPluginmanagerLoading, error: gridviewPluginmanagerError } = useGridViewPluginManager();
    const gridView = gridviewPluginManager?.getGridView();
  
    if (gridviewPluginmanagerError) return "Error:" + gridviewPluginmanagerError;

    const BR = () => {
        return (
            <BrowserRouter forceRefresh={false}>
                <nav style={{ borderBottom: "solid 1px #e8e8e8", overflow: "hidden", boxShadow: "0 0 30px #f3f1f1" }}>
                    <div style={{ width: "200px", float: "left" }}>
                        <Link to="/">
                            <p style={{ height: "38px", margin: "4px 8px", textAlign: "left", color: "#5b8c00", fontSize: "x-large"}}>
                                <img src={process.env.PUBLIC_URL + '/grid-view_icon.png'} alt="grid-view logo" className="logo" style={{ height: "24px", margin: "0 12px 6px 0px" }}/>
                                Grid View
                            </p>
                        </Link>

                    </div>
                    <div style={{ width: "calc(100% - 200px)", float: "left" }}>
                        <Route>
                            <Menu mode="horizontal" style={{ position: "relative", display: "flex", justifyContent: "flex-end", borderBottom: "none" }}>
                                <Menu.Divider/>
                                <UserBar disabled={true} style={{ cursor: "unset" }} />
                            </Menu>
                        </Route>
                    </div>
                </nav>
                
                <div style={{ height: 'calc(100% - 48px)' }}>
                    <Switch>
                        <Route path="/login">
                            <LoginPage />
                        </Route>
                        <PrivateRoute path="/">
                            {
                                !gridviewPluginmanagerLoading && gridView?.components?.mainMenuComponent ? 
                                gridView.components.mainMenuComponent() : 
                                "Loading..."
                            }
                        </PrivateRoute>
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }

    const tokenSetter = (token) => {
        localStorage.setItem('token', token.token);
    }

    return (
        <ReactKeycloakProvider authClient={keycloak} initOptions={keycloakProviderInitOptions} onTokens={tokenSetter}  LoadingComponent={<>Loading...</>}>
            <div style={{height: '100%'}}>
                <ApolloWrapper component={BR} />
            </div>
        </ReactKeycloakProvider>
    );
}

export default App;
