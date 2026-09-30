// All the text on the site lives here. Edit this file to update the portfolio.

export const profile = {
  first: 'Mohamed Amine',
  last: 'Bayoudha',
  title: 'Senior Embedded Machine Learning Engineer',
  tagline: 'Bare-metal firmware · Control systems · On-device ML',
  location: 'Dresden, Germany',
  email: 'aminebayoudha@gmail.com',
  linkedin: 'https://www.linkedin.com/in/mohamed-amine-bayoudha-2474321a5/',
}

export const about = {
  text:
    'I write the code that sits closest to the silicon: bare-metal C/C++ firmware, hard real-time systems, control loops, and neural networks squeezed onto microcontrollers. Over five years I have gone from filter design for robotics to leading the firmware for SpiNNaker2, a neuromorphic supercomputer with more than five million ARM cores.',
  stats: [
    { value: '5M+', label: 'ARM cores running my firmware' },
    { value: '720', label: 'boards in the SpiNNaker2 machine' },
    { value: '8', label: 'firmware engineers led' },
    { value: '30→3', label: 'minutes per firmware deploy' },
  ],
}

export const experience = [
  {
    id: 'spinncloud',
    ref: 'U2',
    company: 'SpiNNcloud Systems',
    place: 'Dresden, Germany',
    role: 'Senior Embedded Machine Learning Engineer',
    dates: 'Mar 2024 — Present',
    points: [
      'Technical lead of an 8-engineer firmware team for the SpiNNaker2 board: 720 boards, 48 chips per board, 152 cores per chip.',
      'Built the FreeRTOS communication kernel and C++ host interface, and designed the SpiNNaker Datagram protocol over Ethernet/UDP and CAN.',
      'Shipped UART, SPI, I2C, DMA and timer drivers to customers, and wrote LLM/DNN compiler kernels validated on LLaMA and YOLO.',
      'Built the hardware-in-the-loop test framework and a CMake + Docker build that cut deploys from 30 to 3 minutes.',
    ],
    tags: ['C', 'C++', 'FreeRTOS', 'ARM Cortex-M4', 'STM32H7', 'Ethernet/UDP', 'CAN', 'CMake', 'Docker', 'GoogleTest'],
  },
  {
    id: 'offenburg',
    ref: 'U3',
    company: 'University of Offenburg',
    place: 'Offenburg, Germany',
    role: 'Embedded Machine Learning Intern',
    dates: 'Mar 2023 — Aug 2023',
    points: [
      'Built a real-time anomaly detector for electromechanical equipment, covering the full TinyML pipeline from 1 kHz accelerometer capture to edge deployment.',
      'Designed and trained an autoencoder, then quantized and compressed it for TensorFlow Lite Micro on an STM32H7.',
      'Reached 97% detection at under 2% false positives in real conditions. The system now monitors industrial fans at the Hahn-Schickard research center.',
    ],
    tags: ['TinyML', 'TFLite Micro', 'STM32H7', 'Autoencoders', 'Quantization'],
  },
  {
    id: 'cassiopeia',
    ref: 'U4',
    company: 'Queen Cassiopeia',
    place: 'Toulouse, France · Remote',
    role: 'Control Systems Engineer',
    dates: 'Sep 2021 — Feb 2023',
    points: [
      'Designed Butterworth, Chebyshev and Bessel digital filters for real-time robotics control, discretized with the Tustin transform.',
      'Built hard real-time control applications on FreeRTOS and STM32F4: task scheduling, interrupt handling and inter-task communication.',
      'Model-based design in MATLAB/Simulink with auto-generated C, profiled for driving simulators and hardware-in-the-loop rigs.',
    ],
    tags: ['FreeRTOS', 'STM32F4', 'MATLAB/Simulink', 'Digital filters', 'HIL'],
  },
]

export const skills = [
  { group: 'Languages', items: ['C (advanced)', 'C++', 'Python', 'ARM assembly'] },
  { group: 'Embedded and real-time', items: ['Bare-metal firmware', 'FreeRTOS', 'Device drivers', 'Interrupts', 'Multi-core sync', 'LPDDR4 / DRAM'] },
  { group: 'Communication', items: ['Ethernet/UDP', 'CAN', 'UART', 'SPI', 'I2C', 'Custom datagram protocols'] },
  { group: 'Control and DSP', items: ['Kalman filtering', 'H-infinity', 'PID', 'LPV', 'RLS estimation', 'Filter design', 'Tustin'] },
  { group: 'Embedded ML', items: ['TinyML', 'TFLite Micro', 'Quantization', 'LLM/DNN kernels'] },
  { group: 'Build and test', items: ['CMake', 'Cross-compilation', 'Docker', 'CI/CD', 'GoogleTest', 'Hardware-in-the-loop'] },
]

export const projects = [
  {
    name: 'Real-time RLS estimation for DC motors',
    text: 'Recursive least squares identification of motor parameters on an STM32F7, with timer- and interrupt-driven sampling. Paper in preparation.',
    tags: ['STM32F7', 'C', 'RLS'],
  },
  {
    name: 'Autonomous drone 3D simulation',
    text: 'Modular multi-axis PID and LPV controllers for a simulated quadrotor, with real-time 3D visualization.',
    tags: ['Python', 'C++', 'PID', 'LPV'],
  },
  {
    name: 'Heat equation on 48 chips',
    text: 'Mapped the discretized heat propagation PDE onto a single SpiNNaker2 board, spreading the computation across all 48 chips.',
    tags: ['SpiNNaker2', 'C', 'Parallel computing'],
  },
]

export const education = [
  {
    degree: 'Research Master (M2), Complex and Intelligent Systems',
    school: 'Tunisia Polytechnic School (EPT)',
    date: '2024',
    note: 'Ranked 1st in cohort',
  },
  {
    degree: 'Engineering Diploma, Control Systems Engineering',
    school: 'INSAT, Tunisia',
    date: '2023',
    note: 'Top 5% · DAAD KOSPIE scholarship for a research stay at Offenburg',
  },
]

export const certifications = ['Professional Certificate in TinyML — edX, 2022', 'UAV 3D Drone Simulation — Udemy, 2023']

export const languages = [
  { name: 'French', level: 'Native' },
  { name: 'Arabic', level: 'Native' },
  { name: 'English', level: 'C1' },
  { name: 'German', level: 'B1' },
]
