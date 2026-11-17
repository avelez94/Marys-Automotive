export type Service = {
  slug: string;
  name: string;
  /** One line, benefit focused, no promises about time or price. */
  summary: string;
};

export type ServiceGroup = {
  code: string;
  title: string;
  intro: string;
  services: Service[];
};

export const serviceGroups: ServiceGroup[] = [
  {
    code: '01',
    title: 'Routine Maintenance',
    intro: 'The regular work that keeps a car dependable and catches small problems early.',
    services: [
      {
        slug: 'oil-changes',
        name: 'Oil Changes',
        summary: 'Fresh oil and a new filter, with a look at the things that wear between visits.',
      },
      {
        slug: 'tires-and-alignments',
        name: 'Tires and Alignments',
        summary: 'Even wear, straight tracking and a steering wheel that sits where it should.',
      },
    ],
  },
  {
    code: '02',
    title: 'Brakes, Steering and Suspension',
    intro: 'How the car stops, steers and handles the road.',
    services: [
      {
        slug: 'brakes-and-rotors',
        name: 'Brakes and Rotors',
        summary: 'Squealing, grinding, pulling or a soft pedal, checked and explained.',
      },
      {
        slug: 'suspension-and-steering',
        name: 'Suspension and Steering',
        summary: 'Clunks over bumps, wandering on the highway and a ride that feels off.',
      },
    ],
  },
  {
    code: '03',
    title: 'Diagnostics and Electrical',
    intro: 'Warning lights, starting trouble and problems that come and go.',
    services: [
      {
        slug: 'check-engine-light',
        name: 'Check Engine Light',
        summary: 'Find out what the light actually means before it turns into something bigger.',
      },
      {
        slug: 'engine-diagnostics',
        name: 'Engine Diagnostics',
        summary: 'Rough idle, hesitation, stalling or poor mileage traced to the cause.',
      },
      {
        slug: 'electrical-repairs',
        name: 'Electrical Repairs',
        summary: 'Lights, windows, gauges and wiring faults tracked down and fixed.',
      },
      {
        slug: 'batteries-and-alternators',
        name: 'Batteries and Alternators',
        summary: 'Slow starts and dim lights tested so you replace the right part.',
      },
    ],
  },
  {
    code: '04',
    title: 'Drivetrain and Comfort',
    intro: 'Shifting, exhaust and keeping the cabin comfortable year round.',
    services: [
      {
        slug: 'transmission-service',
        name: 'Transmission Service',
        summary: 'Slipping, hard shifts or delayed engagement looked at before it gets worse.',
      },
      {
        slug: 'exhaust-and-mufflers',
        name: 'Exhaust and Mufflers',
        summary: 'Loud exhaust, rattles underneath or fumes you can smell inside.',
      },
      {
        slug: 'ac-and-heating',
        name: 'AC and Heating',
        summary: 'Weak air, warm vents in summer or no heat when Indiana gets cold.',
      },
    ],
  },
];

export const allServices = serviceGroups.flatMap((g) => g.services);
