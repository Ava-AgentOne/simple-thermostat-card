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
    _toFormData(): {
        entity: any;
        show_header: boolean;
        show_mode_names: boolean;
        show_mode_icons: boolean;
        show_mode_headings: boolean;
        header_name: any;
        header_icon: any;
        decimals: string;
        step_size: string;
        step_layout: any;
    };
    _fromFormData(data: any): CardConfig;
    _schema(formData: any): ({
        name: string;
        required: boolean;
        selector: {
            entity: {
                domain: string;
            };
        };
        type?: undefined;
        schema?: undefined;
        flatten?: undefined;
    } | {
        name: string;
        type: string;
        schema: {
            name: string;
            selector: {
                boolean: {};
            };
        }[];
        required?: undefined;
        selector?: undefined;
        flatten?: undefined;
    } | {
        name: string;
        type: string;
        schema: ({
            name: string;
            selector: {
                text: {};
                icon?: undefined;
            };
        } | {
            name: string;
            selector: {
                icon: {};
                text?: undefined;
            };
        })[];
        required?: undefined;
        selector?: undefined;
        flatten?: undefined;
    } | {
        name: string;
        type: string;
        flatten: boolean;
        schema: ({
            name: string;
            type: string;
            schema: {
                name: string;
                selector: {
                    select: {
                        mode: string;
                        options: {
                            value: string;
                            label: string;
                        }[];
                    };
                };
            }[];
            selector?: undefined;
        } | {
            name: string;
            selector: {
                select: {
                    mode: string;
                    options: {
                        value: string;
                        label: string;
                    }[];
                };
            };
            type?: undefined;
            schema?: undefined;
        })[];
        required?: undefined;
        selector?: undefined;
    })[];
    _computeLabel: (schema: any) => string;
    render(): import("lit-html").TemplateResult<1>;
    _formValueChanged: (ev: CustomEvent) => void;
    _isHvacModeEnabled(mode: string): boolean;
    _hvacModeChanged(mode: string, checked: boolean): void;
    _formatModeName(mode: string): string;
    _renderHvacModes(): import("lit-html").TemplateResult<1>;
}
