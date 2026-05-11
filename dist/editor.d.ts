import { LitElement } from 'lit';
import { CardConfig } from './config/card';
import { HASS } from './types';
export default class SimpleThermostatEditor extends LitElement {
    config: CardConfig;
    hass: HASS;
    static get styles(): any;
    static get properties(): {
        hass: {};
        config: {};
    };
    static getStubConfig(): {
        header: {};
        layout: {
            mode: {};
        };
    };
    setConfig(config: any): void;
    render(): import("lit-html").TemplateResult<1>;
    valueChanged(ev: any): void;
    toggleHeader(ev: any): void;
    _selectChanged(ev: any): void;
    _readConfigPath(path: string): any;
    _deleteConfigPath(obj: any, path: string): void;
    _isHvacModeEnabled(mode: string): boolean;
    _hvacModeChanged(mode: string, checked: boolean): void;
    _formatModeName(mode: string): string;
    _renderHvacModes(): import("lit-html").TemplateResult<1>;
}
