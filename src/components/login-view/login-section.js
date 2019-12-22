import { LitElement, html, css } from 'lit-element'
import { connect } from 'pwa-helpers'
import { store } from '../../store.js'

// import { logIn } from '../../actions/app-actions.js'
import '@polymer/iron-pages'
import '@material/mwc-button'
import '@material/mwc-checkbox'
import '@material/mwc-icon'
import '@material/mwc-formfield'
import '@polymer/paper-input/paper-input-container.js'
import '@polymer/paper-input/paper-input.js'
import '@polymer/paper-ripple'
import '@polymer/iron-collapse'
// import '@polymer/paper-spinner/paper-spinner-lite.js'
// import '@polymer/iron-flex-layout/iron-flex-layout-classes.js'

import { doLogin, doSelectAddress } from '../../redux/app/app-actions.js'
// import { doUpdateAccountInfo } from '../../redux/user/actions/update-account-info.js'
import { doUpdateAccountName } from '../../redux/user/user-actions.js'
// import { createWallet } from '../../qora/createWallet.js'
// import { createWallet } from '../../api/createWallet.js'
// import { createWallet } from 'frag-qora-crypto'
import { createWallet } from '@frag/crypto'

// import ripple from '../loading-ripple.js'
import ripple from '../../functional-components/loading-ripple.js'

// import '@polymer/iron-pages'
// import '@polymer/paper-icon-button/paper-icon-button.js'
// import { MDCTextField } from '@material/textfield'
// const textField = new MDCTextField(document.querySelector('.mdc-text-field'))

class LoginSection extends connect(store)(LitElement) {
    static get properties () {
        return {
            nextHidden: { type: Boolean, notify: true },
            nextDisabled: { type: Boolean, notify: true },
            nextText: { type: String, notify: true },
            backHidden: { type: Boolean, notify: true },
            backDisabled: { type: Boolean, notify: true },
            backText: { type: String, notify: true },
            hideNav: { type: Boolean, notify: true },

            loginFunction: { type: Object },
            selectedWallet: { type: Object },
            selectedPage: { type: String },
            wallets: { type: Object },
            loginErrorMessage: { type: String },
            rememberMe: { type: Boolean },
            hasStoredWallets: { type: Boolean },
            showPasswordField: { type: Boolean },
            showPinPages: { type: Array }
        }
    }

    static get styles () {
        return [
            css`
                
            `
        ]
    }

    constructor () {
        super()
        this.nextHidden = true
        this.backText = 'Back'

        this.hasStoredWallets = Object.keys(store.getState().user.storedWallets).length > 0
        this.selectedPage = this.hasStoredWallets ? 'storedWallet' : 'loginOptions'
        this.selectedWallet = {}
        this.loginErrorMessage = ''
        this.rememberMe = false
        this.loginOptions = [
            {
                page: 'phrase',
                linkText: 'Seedphrase',
                icon: 'vpn_key'
            },
            {
                page: 'storedWallet',
                linkText: 'Saved account',
                icon: 'save'
            },
            {
                page: 'seed',
                linkText: 'V1 seed',
                icon: 'lock'
            }
        ]
        this.showPinPages = [
            'phrase',
            'seed',
            'V1Seed',
            'backedUpSeed'
        ]
    }

    render () {
        return html`
            <style>
                #loginSection {
                    padding:0;
                    text-align:left;
                    padding-top: 12px;
                }
                #wallets {
                    max-height: 400px;
                    overflow-y:auto;
                    overflow-x:hidden;
                    border-bottom: 1px solid #eee;
                    border-top: 1px solid #eee;
                }
                .wallet {
                    /* max-width: 300px; */
                    position: relative;
                    padding: 12px 24px;
                    cursor: pointer;
                    display: flex;
                }
                .wallet .wallet-details {
                    padding-left:12px;
                    flex: 1;
                    min-width: 0;
                }
                .wallet div .address{
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin:0;
                }
                .wallet .wallet-details h3 {
                    margin:0;
                    padding: 6px 0;
                    font-size:16px;
                }
                .login-option {
                    max-width: 300px;
                    position: relative;
                    padding: 16px 24px 8px 24px;
                    cursor: pointer;
                    display: flex;
                }
                .loginIcon {
                    /* font-size:42px; */
                    padding-right: 12px;
                    margin-top: -2px;
                }
                *[hidden] { 
                    display:none;
                }
                h1 {
                    padding: 24px;
                    padding-top:0;
                    margin:0;
                    font-size:24px;
                    font-weight:100;
                }
                .accountIcon {
                    font-size:42px;
                    padding-top:8px;
                }

                #unlockStoredPage {
                    padding: 24px;
                }
                #unlockStoredPage mwc-icon {
                    font-size:48px;
                }

                @media only screen and (max-width: ${getComputedStyle(document.body).getPropertyValue('--layout-breakpoint-tablet')}) {
                    /* Mobile */
                    #wallets {
                        /* max-height: calc(var(--window-height) - 180px);
                        min-height: calc(var(--window-height) - 180px); */
                        height:100%;
                        overflow-y:auto;
                        overflow-x:hidden;
                    }
                    .wallet {
                        max-width: 100%;
                    }
                }

                #birthMonthContainer, #storageBirthMonthContainer {
                    --paper-input-container-underline: {
                        display: none;
                        visibility: hidden;
                    }
                }
                #birthMonthContainer select, #storageBirthMonthContainer select {
                    padding:8px;
                    width:100%;
                }
                .backButton {
                    padding:14px;
                    text-align:left;
                }
                iron-pages h3{
                    padding-right: 24px;
                    padding-left: 24px;
                    color: #333;
                    font-family: "Roboto mono", monospace;
                    font-weight: 300;
                }
                #pagesContainer {
                    max-height: calc(var(--window-height) - 184px);
                }
            </style>
            
            <div id="loginSection">
                <div id="pagesContainer">
                    <iron-pages selected="${this.selectedPage}" attr-for-selected="page" id="createAccountPages">
                        <div page="loginOptions">
                            <h3>How would you like to login?</h3>
                            ${this.loginOptions.map(({ page, linkText, icon }) => html`
                                <div class="login-option" @click=${() => { this.selectedPage = page }}>
                                    <paper-ripple></paper-ripple>
                                    <div>
                                        <mwc-icon class='loginIcon'>${icon}</mwc-icon>
                                    </div>
                                    <div>
                                        ${linkText}
                                    </div>
                                </div>
                            `)}
                        </div>

                        <div page="storedWallet" id="walletsPage">
                            <h1 style="padding:0; padding-left:24px;">Your accounts</h1>
                            <p style="margin:0; padding: 0 0 12px 24px;">Click your account to login with it</p>
                            <div id="wallets">
                                ${(Object.entries(this.wallets || {}).length < 1) ? html`
                                    <p style="padding: 0 24px 12px 24px;">You need to create or save an account before you can log in!</p>
                                ` : ''}
                                ${Object.entries(this.wallets || {}).map(wallet => html`
                                    <div class="wallet" @click=${() => this.selectWallet(wallet[1])}>
                                        <paper-ripple></paper-ripple>
                                        <div>
                                            <mwc-icon class='accountIcon'>account_circle</mwc-icon>
                                        </div>
                                        <div class="wallet-details">
                                            <h3>${wallet[1].name || wallet[1].address0.substring(0, 5)}</h3>
                                            <p class="address">${wallet[1].address0}</p>
                                        </div>
                                    </div>
                                `)}
                            </div>
                        </div>
                        <div page="phrase" id="phrasePage">
                            <div style="padding:24px;">
                                <div style="display:flex;">
                                    <mwc-icon style="padding: 20px; font-size:24px; padding-left:0; padding-top: 26px;">lock</mwc-icon>
                                    <paper-input style="width:100%;" label="Seedphrase" id="existingSeedPhraseInput" type="password"></paper-input>
                                </div>
                            </div>
                        </div>
                        <div page="seed" id="seedPage">
                            <div style="padding:24px;">
                                <div style="display:flex;">
                                    <mwc-icon style="padding: 20px; font-size:24px; padding-left:0; padding-top: 26px;">lock</mwc-icon>
                                    <paper-input style="width:100%;" label="V1 Seed" id="v1SeedInput" type="password"></paper-input>
                                </div>
                            </div>
                        </div>
                        <div page="unlockStored" id="unlockStoredPage">
                            <div style="text-align:center;">
                                <mwc-icon id='accountIcon' style=" padding-bottom:24px;">account_circle</mwc-icon>
                                <br>
                                <span style="font-size:14px; font-weight:600;">${this.selectedWallet.address0}</span>
                            </div>
                        </div>
                    </iron-pages>

                    <div style="display:flex;" ?hidden=${!(this.showPinPages.includes(this.selectedPage))}>
                        <mwc-icon style="padding: 20px; font-size:24px; padding-left:0; padding-top: 26px;">lock</mwc-icon>
                        <paper-input style="width:100%;" always-float-labell label="Pin" id="unlockStoredPin" type="password"  pattern="[0-9]*" inputmode="numeric" maxlength="4"></paper-input>
                    </div>

                    <iron-collapse style="padding-left:24px; padding-right:24px;" ?opened=${this.showPasswordField} id="passwordCollapse">
                        <div style="display:flex;">
                            <mwc-icon style="padding: 20px; font-size:24px; padding-left:0; padding-top: 26px;">vpn_key</mwc-icon>
                            <paper-input style="width:100%;" always-float-labell label="Password" id="unlockStoredPassword" type="password"></paper-input>
                        </div>
                    </iron-collapse>

                    <div style="text-align: right; color: var(--mdc-theme-error)">
                        ${this.loginErrorMessage}
                    </div>
                        ${['seed', 'phrase', 'backedUpSeed', 'V1Seed'].includes(this.selectedPage) ? html`
                            <!-- Remember me checkbox and fields-->
                            <div style="text-align:right; padding-right:8px; min-height:40px;">
                                <p style="vertical-align: top; line-height: 40px; margin:0;">
                                    <label
                                    for="storeCheckbox"
                                    @click=${() => this.shadowRoot.getElementById('storeCheckbox').click()}
                                    >Save in this browser</label>
                                    <mwc-checkbox id="storeCheckbox" style="margin-bottom:-12px;" @click=${e => { this.rememberMe = !e.target.checked }} ?checked="${this.rememberMe}"></mwc-checkbox>
                                </p>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Passes this.selectedPage to trigger updates -->
                <div style="margin-left:24px; margin-right:24px;" ?hidden=${!(this.loginOptionIsSelected(this.selectedPage) && (this.hasStoredWallets || this.selectedPage !== 'storedWallet'))}>
                    <mwc-button style="margin-top:12px; width:100%;" raised @click=${e => this.login(e)}>Login</mwc-button>
                </div>
            </div>
        `
    }

    firstUpdated () {
        // this.loadingRipple = this.shadowRoot.getElementById('loadingRipple')
        this.loadingRipple = ripple // Just cause I'm lazy...
    }

    selectWallet (wallet) {
        this.selectedWallet = wallet
        this.selectedPage = 'unlockStored'
    }

    stateChanged (state) {
        this.loggedIn = state.app.loggedIn
        this.wallets = state.user.storedWallets
        this.hasStoredWallets = this.wallets.length > 0
    }

    get walletSources () {
        return {
            get seed () {
                const seed = this.shadowRoot.querySelector('#v1SeedInput').value
                return seed
            },
            get storedWallet () {
                const wallet = this.selectedWallet
                const pin = this.shadowRoot.querySelector('#pin').value
                const password = this.shadowRoot.querySelector('#password').value
                // const password = pin + '' + birthMonth
                return {
                    wallet,
                    password
                }
            },
            phrase () {
                const seedPhrase = this.shadowRoot.querySelector('#existingSeedPhraseInput').value
                return seedPhrase
            }
        }
    }

    loginOptionIsSelected () {
        return this.loginOptions.map(op => op.page).includes(this.selectedPage)
    }

    login (e) {
        const type = this.selectedPage
        if (!this.loginOptionIsSelected()) {
            throw new Error('Login option not selected page')
        }
        // First decrypt...
        this.loadingRipple.open({
            x: e.clientX,
            y: e.clientY
        })
            .then(type => {
                const source = this.walletSources[type]
                return createWallet(type, source, status => {
                    this.loadingRipple.loadingMessage = status
                })
            })
            .then(wallet => {
                store.dispatch(doLogin(wallet, password))
                console.log(wallet)
                store.dispatch(doSelectAddress(wallet.addresses[0]))
                // store.dispatch(doUpdateAccountInfo({ name: store.getState().user.storedWallets[wallet.addresses[0].address].name }))
                const storedWallets = store.getState().user.storedWallets
                const walletAddress = storedWallets[wallet.addresses[0].address]
                // STORAGEEEE
                if (walletAddress) {
                    const expectedName = storedWallets[wallet.addresses[0].address].name
                    store.dispatch(doUpdateAccountName(wallet.addresses[0].address, expectedName, false))
                    if (this.rememberMe && type !== 'storedWallet') {
                        //
                    }
                }
                this.cleanup()
                return this.loadingRipple.fade()
            })
            .then(() => {

            })
            .catch(e => {
                this.loginErrorMessage = e
                console.error(e)
                return this.loadingRipple.close()
            })
        // this.loginFunction({
        //     x: e.clientX,
        //     y: e.clientY
        // }, {
        //     save: false,
        //     sourceType: 'storedWallet',
        //     source: {
        //         wallet,
        //         password: pin + '' + birthMonth
        //     }
        // }).then(() => this.cleanup()).catch(e => {
        //     this.loginErrorMessage = e
        // })
    }

    back () {
        if (['seed', 'phrase', 'storedWallet'].includes(this.selectedPage)) {
            this.selectedPage = 'loginOptions'
        } else if (this.selectedPage === 'loginOptions') {
            this.navigate('welcome')
        } else if (this.selectedPage === 'unlockStored') {
            this.selectedPage = 'storedWallet'
        }
    }

    next () {}

    navigate (page) {
        this.dispatchEvent(new CustomEvent('navigate', {
            detail: { page },
            bubbles: true,
            composed: true
        }))
    }

    cleanup () {
        this.wallet = {}
        this.shadowRoot.querySelector('#birthMonth').value = ''
        this.shadowRoot.querySelector('#pin').value = ''
        this.selectedPage = 'wallets'
    }
}

window.customElements.define('login-section', LoginSection)
