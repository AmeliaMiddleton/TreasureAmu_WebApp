import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { MemberService } from '../../core/services/member.service';
import { ThemeSwitcherComponent } from '../../shared/components/theme-switcher/theme-switcher.component';
import { MemberType, SignupType, MEMBER_TYPE_LABELS } from '../../core/models/member.model';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ThemeSwitcherComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly memberService = inject(MemberService);
  private readonly memberTypeSub: Subscription;

  readonly memberTypeLabels = MEMBER_TYPE_LABELS;
  readonly memberTypeKeys = Object.keys(MEMBER_TYPE_LABELS) as MemberType[];

  formState = signal<FormState>('idle');
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  readonly signupForm: FormGroup = this.fb.group({
    signupType:       ['member' as SignupType, Validators.required],
    firstName:        ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName:         ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    email:            ['', [Validators.required, Validators.email]],
    memberType:       ['personal' as MemberType, Validators.required],
    zipCode:          ['', [Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]],
    organizationName: ['', Validators.maxLength(100)],
  });

  get needsOrganizationName(): boolean {
    const type = this.f['memberType'].value as MemberType;
    return type === 'business' || type === 'nonprofit';
  }

  constructor() {
    this.memberTypeSub = this.signupForm.get('memberType')!.valueChanges
      .subscribe((type: MemberType) => {
        const ctrl = this.signupForm.get('organizationName')!;
        if (type === 'business' || type === 'nonprofit') {
          ctrl.addValidators(Validators.required);
        } else {
          ctrl.removeValidators(Validators.required);
          ctrl.setValue('');
        }
        ctrl.updateValueAndValidity();
      });
  }

  ngOnDestroy(): void {
    this.memberTypeSub.unsubscribe();
  }

  get f(): Record<string, AbstractControl> {
    return this.signupForm.controls;
  }

  isInvalid(controlName: string): boolean {
    const ctrl = this.f[controlName];
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  getError(controlName: string): string {
    const ctrl = this.f[controlName];
    if (!ctrl?.errors) return '';
    if (ctrl.errors['required'])   return 'This field is required.';
    if (ctrl.errors['email'])      return 'Please enter a valid email address.';
    if (ctrl.errors['minlength'])  return `Minimum ${ctrl.errors['minlength'].requiredLength} characters.`;
    if (ctrl.errors['maxlength'])  return `Maximum ${ctrl.errors['maxlength'].requiredLength} characters.`;
    if (ctrl.errors['pattern'])    return 'Please enter a valid ZIP code (e.g. 12345 or 12345-6789).';
    return 'Invalid value.';
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.formState.set('submitting');
    this.errorMessage.set('');

    const values = this.signupForm.value;
    this.memberService
      .signup({
        firstName:        values.firstName,
        lastName:         values.lastName,
        email:            values.email,
        memberType:       values.memberType,
        signupType:       values.signupType,
        zipCode:          values.zipCode,
        organizationName: values.organizationName || undefined,
      })
      .subscribe({
        next: (response) => {
          this.formState.set('success');
          const typeLabel = values.signupType === 'newsletter' ? 'newsletter' : 'membership';
          this.successMessage.set(
            response.message ||
            `Thank you! Your ${typeLabel} request has been received. We'll be in touch soon!`,
          );
        },
        error: (err: Error) => {
          this.formState.set('error');
          this.errorMessage.set(err.message);
        },
      });
  }

  resetForm(): void {
    this.signupForm.reset({ signupType: 'member', memberType: 'personal', organizationName: '' });
    this.formState.set('idle');
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  readonly perks = [
    {
      icon: '🏠',
      title: 'Listing Parties Come to You',
      body: 'We rotate hosting at each other\'s homes. List your big furniture and appliances right where they sit — no hauling required.',
    },
    {
      icon: '📸',
      title: 'Professional Photography',
      body: 'We bring the equipment to every party. Your items get great photos from day one, helping them sell faster and for more.',
    },
    {
      icon: '💡',
      title: 'Techy or Not — You Belong',
      body: 'Never sold online before? No problem. Tech-savvy members handle all the listing. You just bring the items!',
    },
    {
      icon: '⭐',
      title: 'First Dibs on Everything',
      body: 'Attend a party and get first pick on every item before anything goes live online. Hidden gems — just for members.',
    },
    {
      icon: '💰',
      title: 'Only 5% When It Sells',
      body: 'Zero upfront costs. We only take a small 5% commission when your item actually sells. No risk, no fees.',
    },
    {
      icon: '🚗',
      title: 'Transportation Available',
      body: 'Need a ride to a party? Limited transportation can be arranged — just let us know when you sign up.',
    },
    {
      icon: '🍽️',
      title: 'Food at Every Party',
      body: 'Every listing party includes food! It\'s a social gathering, not just a chore. Come for the community, stay for the deals.',
    },
    {
      icon: '🤝',
      title: 'Real Community Feel',
      body: 'Spots are intentionally limited to keep this a true neighborhood group — neighbors helping neighbors.',
    },
  ];

  readonly currentYear = new Date().getFullYear();

  readonly steps = [
    { number: 1, label: 'Request to join', detail: 'Submit a request below — it\'s free' },
    { number: 2, label: 'Attend a party', detail: 'Get notified of upcoming listing parties near you' },
    { number: 3, label: 'Bring items or host', detail: 'We\'ll photograph, research, and list together' },
    { number: 4, label: 'Items sell — you keep 95%', detail: 'Payment goes directly to you once the item has been accepted and approved by the customer' },
  ];
}
