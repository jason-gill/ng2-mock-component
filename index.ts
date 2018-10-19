import { Component, EventEmitter, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Examples:
 * CreateMockComponent({ selector: 'some-component' });
 * CreateMockComponent({ selector: 'some-component', inputs: ['some-input', 'some-other-input'] });
 *
 * See https://angular.io/docs/ts/latest/api/core/index/Component-decorator.html for a list
 * of supported properties.
 */

export interface MockComponent {
    value: any;
    disabled: boolean;
}

export function CreateMockComponent(options: Component): Component {

    class Mock implements MockComponent, ControlValueAccessor  {
        @Input() disabled = false;
        onChange;

        _value: any = '';
        get value(): any { return this._value; }
        set value(v: any) {
            if (v !== this._value) {
                if (!this.disabled) {
                    this.writeValue(v);
                }
            }
        }

        writeValue(value: any) {
            this._value = value;
            if (this.onChange) {
                this.onChange(value);
            }
        }

        onTouched = () => {};
        registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
        registerOnTouched(fn: () => void): void { this.onTouched = fn; }
        setDisabledState(isDisabled: boolean): void {
            this.disabled = isDisabled;
        }
    }

    const metadata: Component = {
        selector: options.selector,
        template: options.template || '<ng-content></ng-content>',
        inputs: options.inputs,
        outputs: options.outputs || [],
        exportAs: options.exportAs || '',
        providers: [{
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => Mock),
            multi: true
        }],
    };

    metadata.outputs.forEach(method => {
        Mock.prototype[method] = new EventEmitter<any>();
    });

    metadata.inputs.forEach(property => {
        Mock.prototype[property] = null;
    });

    // Component Decorator to the Mock class
    return Component(metadata)(Mock as any);
}

