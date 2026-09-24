import { AfterViewInit, Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';

@Directive({
  selector:
    'ion-input[placeholder], ion-textarea[placeholder], ion-searchbar[placeholder], input[placeholder], textarea[placeholder]'
})
export class BlinkCaretDirective implements AfterViewInit, OnDestroy {
  private placeholderText: string = '';
  private valueWatchId: number | null = null;
  private nativeInput: HTMLInputElement | HTMLTextAreaElement | null = null;
  private nativeInputHandler: ((ev: Event) => void) | null = null;

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  @Input('placeholder')
  set placeholder(value: string | null) {
    this.placeholderText = value ?? '';
    this.updatePlaceholder();
  }

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    this.capturePlaceholderStyles();
    this.renderer.addClass(host, 'blink-caret');
    this.updatePlaceholder();
    this.syncState();
    setTimeout(() => this.syncState(), 0);
    setTimeout(() => this.syncState(), 150);
    this.setFocused(false);
    this.syncDisabled();
    this.syncNativeMetrics();
    this.syncCaretColor();
    this.attachNativeInputListener();
  }

  ngOnDestroy(): void {
    this.detachNativeInputListener();
    this.stopValueWatch();
  }

  @HostListener('ionInput', ['$event'])
  onIonInput(event: any): void {
    const value = event?.detail?.value;
    if (value !== undefined && value !== null) {
      this.setHasValue(String(value).length > 0);
      this.syncDisabled();
      return;
    }
    this.syncState();
  }

  @HostListener('input', ['$event'])
  onInput(event: any): void {
    const value = event?.target?.value;
    if (value !== undefined && value !== null) {
      this.setHasValue(String(value).length > 0);
      this.syncDisabled();
      return;
    }
    this.syncState();
  }

  @HostListener('ionChange', ['$event'])
  onIonChange(event: any): void {
    const value = event?.detail?.value;
    if (value !== undefined && value !== null) {
      this.setHasValue(String(value).length > 0);
      this.syncDisabled();
      return;
    }
    this.syncState();
  }

  @HostListener('keyup')
  onKeyup(): void {
    this.syncState();
  }

  @HostListener('ionFocus')
  onIonFocus(): void {
    this.setFocused(true);
    this.syncCaretColor();
    this.startValueWatch();
  }

  @HostListener('focusin')
  onFocusIn(): void {
    this.setFocused(true);
    this.syncCaretColor();
    this.startValueWatch();
  }

  @HostListener('focus')
  onFocus(): void {
    this.setFocused(true);
    this.syncCaretColor();
    this.startValueWatch();
  }

  @HostListener('ionBlur')
  onIonBlur(): void {
    this.setFocused(false);
    this.syncState();
    this.stopValueWatch();
  }

  @HostListener('blur')
  onBlur(): void {
    this.setFocused(false);
    this.syncState();
    this.stopValueWatch();
  }

  @HostListener('focusout')
  onFocusOut(): void {
    this.setFocused(false);
    this.syncState();
    this.stopValueWatch();
  }

  private updatePlaceholder(): void {
    const host = this.el.nativeElement;
    const text = this.placeholderText ?? host.getAttribute('placeholder') ?? '';
    this.renderer.setAttribute(host, 'data-placeholder', text);
  }

  private syncState(): void {
    const value = this.getValue();
    this.setHasValue(value.length > 0);
    this.syncDisabled();
    this.syncStateFromIonic();
  }

  private setHasValue(hasValue: boolean): void {
    this.renderer.setAttribute(this.el.nativeElement, 'data-has-value', hasValue ? 'true' : 'false');
  }

  private setFocused(isFocused: boolean): void {
    this.renderer.setAttribute(this.el.nativeElement, 'data-focused', isFocused ? 'true' : 'false');
  }

  private syncDisabled(): void {
    const host = this.el.nativeElement as any;
    const disabled =
      Boolean(host?.disabled) ||
      Boolean(host?.readonly) ||
      Boolean(host?.readOnly) ||
      host?.getAttribute?.('disabled') !== null ||
      host?.getAttribute?.('readonly') !== null;
    this.renderer.setAttribute(this.el.nativeElement, 'data-disabled', disabled ? 'true' : 'false');
  }

  private getValue(): string {
    const host = this.el.nativeElement as any;
    if (host?.value !== undefined && host?.value !== null) {
      return String(host.value);
    }
    const attrValue = host?.getAttribute?.('value');
    if (attrValue !== undefined && attrValue !== null) {
      return String(attrValue);
    }
    const native = this.findNativeInput();
    return native?.value ?? '';
  }

  private async syncStateFromIonic(): Promise<void> {
    const host = this.el.nativeElement as any;
    if (typeof host?.getInputElement !== 'function') {
      return;
    }
    try {
      const inputEl = await host.getInputElement();
      if (inputEl && inputEl.value !== undefined && inputEl.value !== null) {
        this.setHasValue(String(inputEl.value).length > 0);
      }
    } catch {
      // ignore
    }
  }

  private async attachNativeInputListener(): Promise<void> {
    if (this.nativeInputHandler) {
      return;
    }
    const host = this.el.nativeElement as any;
    let inputEl: HTMLInputElement | HTMLTextAreaElement | null = null;
    if (typeof host?.getInputElement === 'function') {
      try {
        inputEl = await host.getInputElement();
      } catch {
        inputEl = null;
      }
    }
    if (!inputEl) {
      inputEl = this.findNativeInput();
    }
    if (!inputEl) {
      return;
    }
    this.nativeInput = inputEl;
    this.nativeInputHandler = (ev: Event) => {
      const target = ev.target as HTMLInputElement | HTMLTextAreaElement | null;
      const value = target?.value ?? '';
      this.setHasValue(String(value).length > 0);
    };
    inputEl.addEventListener('input', this.nativeInputHandler);
    inputEl.addEventListener('change', this.nativeInputHandler);
  }

  private detachNativeInputListener(): void {
    if (!this.nativeInput || !this.nativeInputHandler) {
      return;
    }
    this.nativeInput.removeEventListener('input', this.nativeInputHandler);
    this.nativeInput.removeEventListener('change', this.nativeInputHandler);
    this.nativeInput = null;
    this.nativeInputHandler = null;
  }

  private startValueWatch(): void {
    if (this.valueWatchId !== null) {
      return;
    }
    this.valueWatchId = window.setInterval(() => {
      this.syncState();
      this.syncCaretColor();
    }, 150);
  }

  private stopValueWatch(): void {
    if (this.valueWatchId === null) {
      return;
    }
    clearInterval(this.valueWatchId);
    this.valueWatchId = null;
  }

  private findNativeInput(): HTMLInputElement | HTMLTextAreaElement | null {
    const host = this.el.nativeElement as any;
    if (host instanceof HTMLInputElement || host instanceof HTMLTextAreaElement) {
      return host;
    }
    const root = host?.shadowRoot;
    if (!root) {
      return null;
    }
    return root.querySelector('input, textarea');
  }

  private syncNativeMetrics(): void {
    const native = this.findNativeInput();
    if (!native) {
      return;
    }
    const styles = getComputedStyle(native);
    this.renderer.setStyle(this.el.nativeElement, '--blink-caret-left', styles.paddingLeft);
    this.renderer.setStyle(this.el.nativeElement, '--blink-caret-right', styles.paddingRight);
    this.renderer.setStyle(this.el.nativeElement, '--blink-caret-top', styles.paddingTop);
    this.renderer.setStyle(this.el.nativeElement, '--blink-caret-font-size', styles.fontSize);
    this.renderer.setStyle(this.el.nativeElement, '--blink-caret-font-family', styles.fontFamily);
    this.renderer.setStyle(this.el.nativeElement, '--blink-caret-line-height', styles.lineHeight);
    this.renderer.setStyle(this.el.nativeElement, '--blink-caret-text-align', styles.textAlign);
    this.renderer.setStyle(this.el.nativeElement, '--blink-caret-input-color', styles.color);
  }

  private async syncCaretColor(): Promise<void> {
    let native = this.findNativeInput();
    const host = this.el.nativeElement as any;
    if (!native && typeof host?.getInputElement === 'function') {
      try {
        native = await host.getInputElement();
      } catch {
        native = null;
      }
    }
    if (!native) {
      return;
    }
    const hostStyles = getComputedStyle(this.el.nativeElement);
    const activeColor = hostStyles.getPropertyValue('--blink-caret-active-color').trim();
    const fallbackColor = hostStyles.getPropertyValue('color').trim();
    const caretColor = activeColor || fallbackColor || '#20c45a';
    native.style.caretColor = caretColor;
  }

  private capturePlaceholderStyles(): void {
    const host = this.el.nativeElement;
    const styles = getComputedStyle(host);
    const placeholderColor = styles.getPropertyValue('--placeholder-color').trim();
    const placeholderOpacity = styles.getPropertyValue('--placeholder-opacity').trim();
    if (placeholderColor) {
      this.renderer.setStyle(host, '--blink-caret-color', placeholderColor);
    }
    if (placeholderOpacity) {
      this.renderer.setStyle(host, '--blink-caret-opacity', placeholderOpacity);
    }
  }
}
