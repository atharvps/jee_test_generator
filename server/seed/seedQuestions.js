require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI ;

const physicsQuestions = [
  { subject: 'Physics', chapter: 'Mechanics', difficulty: 'Easy', type: 'MCQ', question_text: 'A ball is thrown vertically upward with a velocity of 20 m/s. What is the maximum height reached? (g = 10 m/s²)', options: ['10 m', '20 m', '30 m', '40 m'], correct_answer: '20 m', solution: 'Using v² = u² - 2gh → 0 = 400 - 20h → h = 20 m', tags: ['kinematics', 'projectile'] },
  { subject: 'Physics', chapter: 'Mechanics', difficulty: 'Medium', type: 'MCQ', question_text: 'A block of mass 5 kg is pulled along a rough surface with coefficient of kinetic friction 0.3. What is the friction force? (g = 10 m/s²)', options: ['10 N', '15 N', '20 N', '25 N'], correct_answer: '15 N', solution: 'f = μmg = 0.3 × 5 × 10 = 15 N', tags: ['friction', 'newton'] },
  { subject: 'Physics', chapter: 'Thermodynamics', difficulty: 'Medium', type: 'MCQ', question_text: 'In a Carnot engine operating between 300 K and 600 K, what is the efficiency?', options: ['25%', '33%', '50%', '67%'], correct_answer: '50%', solution: 'η = 1 - T_cold/T_hot = 1 - 300/600 = 0.5 = 50%', tags: ['carnot', 'efficiency'] },
  { subject: 'Physics', chapter: 'Electrostatics', difficulty: 'Hard', type: 'MCQ', question_text: 'Two point charges +2q and -q are placed at (0,0) and (d,0) respectively. Where on the x-axis is the electric field zero?', options: ['x = d(√2 + 1)', 'x = -d(√2 + 1)', 'x = d/(√2 - 1)', 'x = 2d'], correct_answer: 'x = -d(√2 + 1)', solution: 'Setting up E1 = E2 and solving gives x = -d(√2 + 1)', tags: ['electrostatics', 'field'] },
  { subject: 'Physics', chapter: 'Waves', difficulty: 'Easy', type: 'MCQ', question_text: 'The speed of sound in air at 0°C is 332 m/s. At what temperature will it be 344 m/s?', options: ['7°C', '10°C', '12°C', '15°C'], correct_answer: '10°C', solution: 'v ∝ √T, so (344/332)² = T2/273 → T2 ≈ 283 K = 10°C', tags: ['sound', 'temperature'] },
  { subject: 'Physics', chapter: 'Optics', difficulty: 'Medium', type: 'MCQ', question_text: 'A convex lens of focal length 20 cm forms a real image twice the size of the object. What is the object distance?', options: ['20 cm', '30 cm', '40 cm', '60 cm'], correct_answer: '30 cm', solution: 'For real image, m = -v/u = -2, and 1/f = 1/v - 1/u gives u = 30 cm', tags: ['optics', 'lens'] },
  { subject: 'Physics', chapter: 'Modern Physics', difficulty: 'Hard', type: 'MCQ', question_text: 'The de Broglie wavelength of a proton moving with velocity v is λ. What is the de Broglie wavelength of an alpha particle moving with same velocity?', options: ['λ/4', 'λ/2', 'λ', '2λ'], correct_answer: 'λ/4', solution: 'λ = h/mv. m_alpha = 4m_p, so λ_alpha = h/(4m_p × v) = λ/4', tags: ['de-broglie', 'waves'] },
  { subject: 'Physics', chapter: 'Electromagnetism', difficulty: 'Medium', type: 'MCQ', question_text: 'A long straight wire carries current I. The magnetic field at a distance r from the wire is proportional to:', options: ['r', '1/r', 'r²', '1/r²'], correct_answer: '1/r', solution: 'By Ampere\'s law, B = μ₀I/(2πr), so B ∝ 1/r', tags: ['magnetism', 'ampere'] },
  { subject: 'Physics', chapter: 'Mechanics', difficulty: 'Hard', type: 'MCQ', question_text: 'A disc of moment of inertia I and angular velocity ω₀ is brought to rest by a constant torque τ. The number of revolutions before stopping is:', options: ['Iω₀²/(4πτ)', 'Iω₀²/(2πτ)', 'Iω₀/(2πτ)', 'Iω₀²/(πτ)'], correct_answer: 'Iω₀²/(4πτ)', solution: 'Using ω² = ω₀² - 2ατ, θ = ω₀²/(2α) = Iω₀²/(2τ) radians = Iω₀²/(4πτ) revolutions', tags: ['rotation', 'torque'] },
  { subject: 'Physics', chapter: 'Thermodynamics', difficulty: 'Easy', type: 'MCQ', question_text: 'An ideal gas undergoes isothermal compression. Which of the following is true?', options: ['Temperature increases', 'Internal energy decreases', 'Work is done on the gas', 'Entropy increases'], correct_answer: 'Work is done on the gas', solution: 'In isothermal compression, volume decreases so work is done ON the gas. Temperature stays constant.', tags: ['ideal-gas', 'isothermal'] },
  { subject: 'Physics', chapter: 'Electrostatics', difficulty: 'Medium', type: 'MCQ', question_text: 'A parallel plate capacitor has capacitance C. If the distance between plates is doubled and a dielectric of constant K=3 is inserted, new capacitance is:', options: ['3C/2', '2C/3', '3C', 'C/3'], correct_answer: '3C/2', solution: 'C_new = Kε₀A/(2d) = 3C/2', tags: ['capacitor', 'dielectric'] },
  { subject: 'Physics', chapter: 'Waves', difficulty: 'Hard', type: 'MCQ', question_text: 'Two waves of same frequency and amplitude travel in same direction. For destructive interference, phase difference should be:', options: ['0, 2π, 4π...', 'π, 3π, 5π...', 'π/2, 3π/2...', 'Any value'], correct_answer: 'π, 3π, 5π...', solution: 'Destructive interference occurs when phase difference = (2n-1)π for integer n', tags: ['interference', 'waves'] },
  { subject: 'Physics', chapter: 'Modern Physics', difficulty: 'Medium', type: 'MCQ', question_text: 'The half-life of a radioactive substance is 30 days. What fraction remains after 90 days?', options: ['1/2', '1/4', '1/8', '1/16'], correct_answer: '1/8', solution: '90 days = 3 half-lives. Remaining fraction = (1/2)³ = 1/8', tags: ['radioactivity', 'half-life'] },
  { subject: 'Physics', chapter: 'Optics', difficulty: 'Easy', type: 'MCQ', question_text: 'Total internal reflection occurs when light travels from:', options: ['Rarer to denser medium at any angle', 'Denser to rarer medium at an angle less than critical angle', 'Denser to rarer medium at an angle greater than critical angle', 'Rarer to denser at critical angle'], correct_answer: 'Denser to rarer medium at an angle greater than critical angle', solution: 'TIR occurs when angle of incidence exceeds critical angle while going from denser to rarer medium.', tags: ['optics', 'TIR'] },
  { subject: 'Physics', chapter: 'Electromagnetism', difficulty: 'Hard', type: 'MCQ', question_text: 'An LC circuit has inductance 1 mH and capacitance 1 μF. Angular frequency of oscillation is:', options: ['10³ rad/s', '10⁶ rad/s', '10⁴ rad/s', '10⁵ rad/s'], correct_answer: '10⁶ rad/s', solution: 'ω = 1/√(LC) = 1/√(10⁻³ × 10⁻⁶) = 1/10⁻⁴·⁵ = 10⁶ rad/s (approximately)', tags: ['LC-circuit', 'oscillation'] },
  { subject:'Physics', chapter:'Mechanics', difficulty:'Easy', type:'MCQ', question_text:'Acceleration due to gravity on Earth is approximately:', options:['8.9 m/s²','9.8 m/s²','10.8 m/s²','12 m/s²'], correct_answer:'9.8 m/s²', solution:'Standard value of gravitational acceleration near Earth surface.', tags:['gravity']},
  { subject:'Physics', chapter:'Mechanics', difficulty:'Medium', type:'MCQ', question_text:'Momentum of a 2 kg body moving with velocity 5 m/s is:', options:['5','10','15','20'], correct_answer:'10', solution:'p = mv = 2×5 = 10', tags:['momentum']},
  { subject:'Physics', chapter:'Mechanics', difficulty:'Hard', type:'MCQ', question_text:'Work done when force 10N moves object 5m in same direction:', options:['10J','25J','50J','100J'], correct_answer:'50J', solution:'W = Fd = 10×5 = 50', tags:['work']},
  { subject:'Physics', chapter:'Thermodynamics', difficulty:'Easy', type:'MCQ', question_text:'SI unit of heat is:', options:['Watt','Joule','Kelvin','Newton'], correct_answer:'Joule', solution:'Heat is energy measured in Joules.', tags:['heat']},
  { subject:'Physics', chapter:'Optics', difficulty:'Easy', type:'MCQ', question_text:'Speed of light in vacuum is:', options:['3×10⁶','3×10⁸','3×10⁴','3×10²'], correct_answer:'3×10⁸', solution:'Constant value.', tags:['light']},
  { subject:'Physics', chapter:'Electricity', difficulty:'Medium', type:'MCQ', question_text:'Ohm’s law states V = ?', options:['IR','I/R','R/I','R+I'], correct_answer:'IR', solution:'Ohm law relation.', tags:['ohm']},
  { subject:'Physics', chapter:'Electricity', difficulty:'Easy', type:'MCQ', question_text:'Unit of electric current:', options:['Ampere','Volt','Ohm','Watt'], correct_answer:'Ampere', solution:'SI unit.', tags:['current']},
  { subject:'Physics', chapter:'Magnetism', difficulty:'Medium', type:'MCQ', question_text:'Magnetic field around current carrying wire discovered by:', options:['Faraday','Oersted','Newton','Tesla'], correct_answer:'Oersted', solution:'Oersted experiment.', tags:['magnetism']},
  { subject:'Physics', chapter:'Modern Physics', difficulty:'Easy', type:'MCQ', question_text:'Charge of electron is:', options:['1.6×10⁻¹⁹ C','1.6×10⁻¹⁸','1.6×10⁻¹⁷','1.6×10⁻¹⁶'], correct_answer:'1.6×10⁻¹⁹ C', solution:'Fundamental charge.', tags:['electron']},
  { subject:'Physics', chapter:'Waves', difficulty:'Medium', type:'MCQ', question_text:'Frequency unit is:', options:['Hz','m/s','N','kg'], correct_answer:'Hz', solution:'Hertz.', tags:['frequency']},
  { subject:'Physics', chapter:'Optics', difficulty:'Medium', type:'MCQ', question_text:'Mirror used in shaving mirror:', options:['Plane','Concave','Convex','None'], correct_answer:'Concave', solution:'Produces magnified image.', tags:['mirror']},
  { subject:'Physics', chapter:'Thermodynamics', difficulty:'Medium', type:'MCQ', question_text:'Absolute zero temperature:', options:['0K','273K','100K','-273K'], correct_answer:'0K', solution:'Lowest temperature.', tags:['temperature']},
  { subject:'Physics', chapter:'Mechanics', difficulty:'Medium', type:'MCQ', question_text:'Unit of power:', options:['J','W','N','Pa'], correct_answer:'W', solution:'Watt.', tags:['power']},
  { subject:'Physics', chapter:'Electricity', difficulty:'Hard', type:'MCQ', question_text:'Equivalent resistance of two 2Ω resistors in series:', options:['1','2','4','8'], correct_answer:'4', solution:'Series add.', tags:['resistance']},
  { subject:'Physics', chapter:'Electricity', difficulty:'Hard', type:'MCQ', question_text:'Equivalent resistance of two 2Ω resistors in parallel:', options:['1','2','4','8'], correct_answer:'1', solution:'Parallel formula.', tags:['resistance']},
  { subject:'Physics', chapter:'Waves', difficulty:'Easy', type:'MCQ', question_text:'Human audible frequency range:', options:['20–20kHz','10–10kHz','100–1000','1–10'], correct_answer:'20–20kHz', solution:'Standard.', tags:['sound']},
  { subject:'Physics', chapter:'Modern Physics', difficulty:'Medium', type:'MCQ', question_text:'Photon energy formula:', options:['E=mc²','E=hf','E=mv','E=Fq'], correct_answer:'E=hf', solution:'Planck relation.', tags:['photon']},
  { subject:'Physics', chapter:'Mechanics', difficulty:'Medium', type:'MCQ', question_text:'Impulse equals:', options:['Force×time','Force×distance','Mass×velocity','Mass×acc'], correct_answer:'Force×time', solution:'Impulse definition.', tags:['impulse']},
  { subject:'Physics', chapter:'Optics', difficulty:'Hard', type:'MCQ', question_text:'Refractive index formula:', options:['c/v','v/c','c²/v','v²/c'], correct_answer:'c/v', solution:'Definition.', tags:['refraction']},
  { subject:'Physics', chapter:'Mechanics', difficulty:'Easy', type:'MCQ', question_text:'Unit of force:', options:['Newton','Joule','Watt','Volt'], correct_answer:'Newton', solution:'SI unit.', tags:['force']},
];

const chemistryQuestions = [
  { subject: 'Chemistry', chapter: 'Atomic Structure', difficulty: 'Easy', type: 'MCQ', question_text: 'The number of electrons in an atom with atomic number 17 and mass number 35 is:', options: ['17', '18', '35', '52'], correct_answer: '17', solution: 'Electrons = atomic number = 17. Chlorine has 17 electrons.', tags: ['atomic-structure'] },
  { subject: 'Chemistry', chapter: 'Chemical Bonding', difficulty: 'Medium', type: 'MCQ', question_text: 'The hybridization of sulfur in SF₄ is:', options: ['sp²', 'sp³', 'sp³d', 'sp³d²'], correct_answer: 'sp³d', solution: 'SF₄ has 4 bond pairs + 1 lone pair = 5 electron pairs → sp³d hybridization', tags: ['hybridization', 'VSEPR'] },
  { subject: 'Chemistry', chapter: 'Thermodynamics', difficulty: 'Hard', type: 'MCQ', question_text: 'For a reaction to be spontaneous at all temperatures, which condition must be satisfied?', options: ['ΔH > 0, ΔS > 0', 'ΔH < 0, ΔS < 0', 'ΔH < 0, ΔS > 0', 'ΔH > 0, ΔS < 0'], correct_answer: 'ΔH < 0, ΔS > 0', solution: 'ΔG = ΔH - TΔS < 0 for all T requires ΔH < 0 and ΔS > 0', tags: ['thermodynamics', 'gibbs'] },
  { subject: 'Chemistry', chapter: 'Equilibrium', difficulty: 'Medium', type: 'MCQ', question_text: 'For a reaction A ⇌ B with Kc = 4 at temperature T, if [A] = 2 M, what is [B] at equilibrium?', options: ['2 M', '4 M', '6 M', '8 M'], correct_answer: '8 M', solution: 'Kc = [B]/[A] = 4, so [B] = 4 × 2 = 8 M', tags: ['equilibrium', 'Kc'] },
  { subject: 'Chemistry', chapter: 'Organic Chemistry', difficulty: 'Easy', type: 'MCQ', question_text: 'Which of the following is an electrophile?', options: ['NH₃', 'H₂O', 'BF₃', 'CH₃⁻'], correct_answer: 'BF₃', solution: 'BF₃ is electron deficient (boron has empty orbital) so it is an electrophile.', tags: ['electrophile', 'organic'] },
  { subject: 'Chemistry', chapter: 'Electrochemistry', difficulty: 'Hard', type: 'MCQ', question_text: 'For a cell Zn|Zn²⁺||Cu²⁺|Cu, if E°Zn²⁺/Zn = -0.76V and E°Cu²⁺/Cu = +0.34V, the EMF is:', options: ['0.42 V', '1.10 V', '1.52 V', '0.76 V'], correct_answer: '1.10 V', solution: 'EMF = E°cathode - E°anode = 0.34 - (-0.76) = 1.10 V', tags: ['electrochemistry', 'EMF'] },
  { subject: 'Chemistry', chapter: 'Chemical Kinetics', difficulty: 'Medium', type: 'MCQ', question_text: 'The rate constant of a reaction at 300 K is k₁ and at 400 K is k₂. If Ea = 100 kJ/mol, ratio k₂/k₁ is approximately:', options: ['2.8', '10', '72', '25'], correct_answer: '72', solution: 'Using Arrhenius equation, ln(k₂/k₁) = Ea/R × (1/T₁ - 1/T₂) ≈ 4.27, k₂/k₁ ≈ e^4.27 ≈ 72', tags: ['kinetics', 'arrhenius'] },
  { subject: 'Chemistry', chapter: 'p-Block Elements', difficulty: 'Easy', type: 'MCQ', question_text: 'Which of the following oxides is amphoteric?', options: ['Na₂O', 'SO₃', 'Al₂O₃', 'CaO'], correct_answer: 'Al₂O₃', solution: 'Al₂O₃ reacts with both acids and bases making it amphoteric.', tags: ['p-block', 'amphoteric'] },
  { subject: 'Chemistry', chapter: 'Organic Chemistry', difficulty: 'Hard', type: 'MCQ', question_text: 'Which compound gives Lucas test result immediately (cloudiness within seconds)?', options: ['Primary alcohol', 'Secondary alcohol', 'Tertiary alcohol', 'Phenol'], correct_answer: 'Tertiary alcohol', solution: 'Tertiary alcohols form carbocation most easily, giving immediate cloudiness in Lucas test.', tags: ['organic', 'alcohols', 'lucas'] },
  { subject: 'Chemistry', chapter: 'Coordination Compounds', difficulty: 'Hard', type: 'MCQ', question_text: '[Fe(CN)₆]⁴⁻ is diamagnetic. What is the hybridization of Fe?', options: ['sp³d²', 'd²sp³', 'sp³', 'dsp²'], correct_answer: 'd²sp³', solution: 'CN⁻ is strong field ligand causing pairing. Fe²⁺ has d⁶ configuration. Inner orbital complex with d²sp³ hybridization.', tags: ['coordination', 'hybridization'] },
  { subject: 'Chemistry', chapter: 'Solid State', difficulty: 'Medium', type: 'MCQ', question_text: 'In a face-centered cubic (FCC) lattice, how many atoms are present per unit cell?', options: ['1', '2', '4', '6'], correct_answer: '4', solution: 'FCC: 8 corners × 1/8 + 6 faces × 1/2 = 1 + 3 = 4 atoms per unit cell', tags: ['solid-state', 'FCC'] },
  { subject: 'Chemistry', chapter: 'Solutions', difficulty: 'Easy', type: 'MCQ', question_text: 'Which of the following is a colligative property?', options: ['Optical rotation', 'Viscosity', 'Osmotic pressure', 'Conductance'], correct_answer: 'Osmotic pressure', solution: 'Colligative properties depend only on number of solute particles. Osmotic pressure is a colligative property.', tags: ['solutions', 'colligative'] },
  { subject: 'Chemistry', chapter: 'Polymers', difficulty: 'Easy', type: 'MCQ', question_text: 'Nylon-6,6 is formed by condensation of:', options: ['Caprolactam', 'Hexamethylenediamine + Adipic acid', 'Ethylene glycol + Terephthalic acid', 'Vinyl chloride'], correct_answer: 'Hexamethylenediamine + Adipic acid', solution: 'Nylon-6,6 is formed by condensation polymerization of hexamethylenediamine and adipic acid.', tags: ['polymers', 'nylon'] },
  { subject: 'Chemistry', chapter: 'Biomolecules', difficulty: 'Medium', type: 'MCQ', question_text: 'The secondary structure of proteins is maintained by:', options: ['Peptide bonds', 'Disulfide bonds', 'Hydrogen bonds', 'Ionic bonds'], correct_answer: 'Hydrogen bonds', solution: 'Alpha helix and beta sheet (secondary structures) are maintained by hydrogen bonds between NH and C=O groups.', tags: ['biomolecules', 'proteins'] },
  { subject: 'Chemistry', chapter: 'Chemical Bonding', difficulty: 'Easy', type: 'MCQ', question_text: 'The number of lone pairs on the central atom in XeF₄ is:', options: ['0', '1', '2', '3'], correct_answer: '2', solution: 'XeF₄: Xe has 8 electrons. 4 bond pairs used, 2 lone pairs remain on Xe. Square planar geometry.', tags: ['VSEPR', 'xenon'] },
  { subject:'Chemistry', chapter:'Atomic Structure', difficulty:'Easy', type:'MCQ', question_text:'Atomic number represents:', options:['Protons','Neutrons','Electrons','Mass'], correct_answer:'Protons', solution:'Atomic number = number of protons.', tags:['atomic']},
  { subject:'Chemistry', chapter:'Periodic Table', difficulty:'Easy', type:'MCQ', question_text:'Element with atomic number 1:', options:['Helium','Hydrogen','Lithium','Carbon'], correct_answer:'Hydrogen', solution:'H = 1.', tags:['periodic']},
  { subject:'Chemistry', chapter:'Chemical Bonding', difficulty:'Medium', type:'MCQ', question_text:'NaCl bond type:', options:['Covalent','Ionic','Metallic','Hydrogen'], correct_answer:'Ionic', solution:'Electron transfer.', tags:['bond']},
  { subject:'Chemistry', chapter:'Organic Chemistry', difficulty:'Easy', type:'MCQ', question_text:'Simplest alkane:', options:['Methane','Ethane','Propane','Butane'], correct_answer:'Methane', solution:'CH4.', tags:['organic']},
  { subject:'Chemistry', chapter:'Acids Bases', difficulty:'Easy', type:'MCQ', question_text:'pH of neutral solution:', options:['0','7','14','1'], correct_answer:'7', solution:'Neutral.', tags:['ph']},
  { subject:'Chemistry', chapter:'States of Matter', difficulty:'Medium', type:'MCQ', question_text:'Gas law PV = ?', options:['nRT','RT','nT','nR'], correct_answer:'nRT', solution:'Ideal gas law.', tags:['gas']},
  { subject:'Chemistry', chapter:'Redox', difficulty:'Medium', type:'MCQ', question_text:'Oxidation means:', options:['Gain e','Loss e','Gain proton','Loss proton'], correct_answer:'Loss e', solution:'Definition.', tags:['redox']},
  { subject:'Chemistry', chapter:'Electrochemistry', difficulty:'Medium', type:'MCQ', question_text:'Anode is site of:', options:['Reduction','Oxidation','Neutral','Fusion'], correct_answer:'Oxidation', solution:'Anode oxidation.', tags:['electrochem']},
  { subject:'Chemistry', chapter:'Organic', difficulty:'Hard', type:'MCQ', question_text:'Benzene formula:', options:['C6H6','C6H12','C5H6','C7H8'], correct_answer:'C6H6', solution:'Aromatic.', tags:['benzene']},
  { subject:'Chemistry', chapter:'Environmental', difficulty:'Easy', type:'MCQ', question_text:'Ozone formula:', options:['O','O2','O3','O4'], correct_answer:'O3', solution:'Triatomic oxygen.', tags:['ozone']},
];

const mathQuestions = [
  { subject: 'Mathematics', chapter: 'Calculus', difficulty: 'Easy', type: 'MCQ', question_text: 'The derivative of sin²(x) with respect to x is:', options: ['2sin(x)', 'sin(2x)', '2cos(x)', 'cos(2x)'], correct_answer: 'sin(2x)', solution: 'd/dx[sin²x] = 2sin(x)cos(x) = sin(2x)', tags: ['calculus', 'differentiation'] },
  { subject: 'Mathematics', chapter: 'Algebra', difficulty: 'Medium', type: 'MCQ', question_text: 'If α and β are roots of x² - 5x + 6 = 0, find α³ + β³:', options: ['35', '45', '55', '65'], correct_answer: '35', solution: 'α+β=5, αβ=6. α³+β³ = (α+β)³ - 3αβ(α+β) = 125 - 90 = 35', tags: ['algebra', 'roots'] },
  { subject: 'Mathematics', chapter: 'Coordinate Geometry', difficulty: 'Medium', type: 'MCQ', question_text: 'The equation of a circle with center (2, -3) and radius 5 is:', options: ['(x-2)²+(y+3)²=5', '(x-2)²+(y+3)²=25', '(x+2)²+(y-3)²=25', '(x-2)²+(y-3)²=25'], correct_answer: '(x-2)²+(y+3)²=25', solution: 'Standard form: (x-h)² + (y-k)² = r². With h=2, k=-3, r=5: (x-2)²+(y+3)²=25', tags: ['circles', 'coordinate'] },
  { subject: 'Mathematics', chapter: 'Trigonometry', difficulty: 'Easy', type: 'MCQ', question_text: 'The value of sin(75°) is:', options: ['(√6+√2)/4', '(√6-√2)/4', '(√3+1)/2√2', '√3/2'], correct_answer: '(√6+√2)/4', solution: 'sin(75°) = sin(45°+30°) = sin45°cos30° + cos45°sin30° = (√2/2)(√3/2) + (√2/2)(1/2) = (√6+√2)/4', tags: ['trigonometry'] },
  { subject: 'Mathematics', chapter: 'Calculus', difficulty: 'Hard', type: 'MCQ', question_text: '∫₀^π x·sin(x) dx equals:', options: ['π', '0', '2π', '1'], correct_answer: 'π', solution: 'Integration by parts: -x·cos(x)|₀^π + ∫₀^π cos(x) dx = π + [sin(x)]₀^π = π + 0 = π', tags: ['integration', 'calculus'] },
  { subject: 'Mathematics', chapter: 'Probability', difficulty: 'Medium', type: 'MCQ', question_text: 'Two dice are thrown simultaneously. Probability of getting sum = 7 is:', options: ['1/6', '1/9', '5/36', '7/36'], correct_answer: '1/6', solution: 'Favorable outcomes: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6. Total = 36. P = 6/36 = 1/6', tags: ['probability', 'dice'] },
  { subject: 'Mathematics', chapter: 'Matrices', difficulty: 'Medium', type: 'MCQ', question_text: 'If A is a 3×3 matrix with |A| = 5, then |3A| equals:', options: ['15', '45', '135', '25'], correct_answer: '135', solution: '|kA| = kⁿ|A| for n×n matrix. |3A| = 3³ × 5 = 27 × 5 = 135', tags: ['matrices', 'determinant'] },
  { subject: 'Mathematics', chapter: 'Vectors', difficulty: 'Easy', type: 'MCQ', question_text: 'If vectors a⃗ = 2î + 3ĵ and b⃗ = î - ĵ, then |a⃗ + b⃗| is:', options: ['√5', '√10', '√13', '5'], correct_answer: '√10', solution: 'a⃗ + b⃗ = 3î + 2ĵ. |a⃗ + b⃗| = √(9+4) = √13', tags: ['vectors'] },
  { subject: 'Mathematics', chapter: 'Complex Numbers', difficulty: 'Hard', type: 'MCQ', question_text: 'The modulus of (1+i)/(1-i) is:', options: ['0', '1', '2', '√2'], correct_answer: '1', solution: '(1+i)/(1-i) = (1+i)²/2 = 2i/2 = i. |i| = 1', tags: ['complex-numbers'] },
  { subject: 'Mathematics', chapter: 'Sequences and Series', difficulty: 'Medium', type: 'MCQ', question_text: 'Sum of first n terms of a GP with first term a and ratio r is:', options: ['a(rⁿ-1)/(r-1)', 'a(1-rⁿ)/(1-r)', 'Both A and B', 'n(a+l)/2'], correct_answer: 'Both A and B', solution: 'Both formulas are equivalent. S = a(rⁿ-1)/(r-1) = a(1-rⁿ)/(1-r)', tags: ['GP', 'series'] },
  { subject: 'Mathematics', chapter: 'Permutations and Combinations', difficulty: 'Easy', type: 'MCQ', question_text: 'In how many ways can 5 books be arranged on a shelf?', options: ['25', '60', '120', '720'], correct_answer: '120', solution: '5! = 5 × 4 × 3 × 2 × 1 = 120', tags: ['permutations'] },
  { subject: 'Mathematics', chapter: 'Calculus', difficulty: 'Medium', type: 'MCQ', question_text: 'The area enclosed between y = x² and y = x is:', options: ['1/3', '1/6', '1/2', '1/4'], correct_answer: '1/6', solution: 'Points of intersection: x=0 and x=1. Area = ∫₀¹(x - x²)dx = [x²/2 - x³/3]₀¹ = 1/2 - 1/3 = 1/6', tags: ['integration', 'area'] },
  { subject: 'Mathematics', chapter: 'Conic Sections', difficulty: 'Hard', type: 'MCQ', question_text: 'For the ellipse x²/16 + y²/9 = 1, eccentricity is:', options: ['√7/4', '√7/3', '3/4', '4/3'], correct_answer: '√7/4', solution: 'a²=16, b²=9. c² = a²-b² = 7, c = √7. e = c/a = √7/4', tags: ['ellipse', 'conic'] },
  { subject: 'Mathematics', chapter: 'Differential Equations', difficulty: 'Hard', type: 'MCQ', question_text: 'Order and degree of (y″)³ + (y′)⁴ + y = 0 are:', options: ['2, 3', '2, 1', '3, 3', '1, 3'], correct_answer: '2, 3', solution: 'Order = highest derivative order = 2 (y″). Degree = power of highest derivative = 3.', tags: ['differential-equations'] },
  { subject: 'Mathematics', chapter: 'Statistics', difficulty: 'Easy', type: 'MCQ', question_text: 'If mean of 5 observations is 10, what is their sum?', options: ['2', '15', '50', '100'], correct_answer: '50', solution: 'Sum = Mean × n = 10 × 5 = 50', tags: ['statistics', 'mean'] },
  { subject:'Mathematics', chapter:'Algebra', difficulty:'Easy', type:'MCQ', question_text:'Value of 2² + 3²:', options:['13','12','10','8'], correct_answer:'13', solution:'4+9=13', tags:['algebra']},
  { subject:'Mathematics', chapter:'Trigonometry', difficulty:'Easy', type:'MCQ', question_text:'sin(90°)=?', options:['0','1','-1','½'], correct_answer:'1', solution:'Standard.', tags:['trig']},
  { subject:'Mathematics', chapter:'Geometry', difficulty:'Easy', type:'MCQ', question_text:'Sum of angles of triangle:', options:['90','180','360','270'], correct_answer:'180', solution:'Triangle rule.', tags:['triangle']},
  { subject:'Mathematics', chapter:'Calculus', difficulty:'Medium', type:'MCQ', question_text:'Derivative of x²:', options:['x','2x','x²','1'], correct_answer:'2x', solution:'Power rule.', tags:['derivative']},
  { subject:'Mathematics', chapter:'Probability', difficulty:'Easy', type:'MCQ', question_text:'Probability of head in fair coin:', options:['0','1','1/2','2'], correct_answer:'1/2', solution:'Two outcomes.', tags:['probability']},
  { subject:'Mathematics', chapter:'Matrices', difficulty:'Medium', type:'MCQ', question_text:'Identity matrix diagonal values:', options:['0','1','2','-1'], correct_answer:'1', solution:'Definition.', tags:['matrix']},
  { subject:'Mathematics', chapter:'Statistics', difficulty:'Easy', type:'MCQ', question_text:'Mean formula:', options:['sum/n','sum×n','n/sum','sum²'], correct_answer:'sum/n', solution:'Definition.', tags:['mean']},
  { subject:'Mathematics', chapter:'Vectors', difficulty:'Medium', type:'MCQ', question_text:'Dot product of perpendicular vectors:', options:['0','1','2','-1'], correct_answer:'0', solution:'Cos90=0.', tags:['vectors']},
  { subject:'Mathematics', chapter:'Logarithms', difficulty:'Medium', type:'MCQ', question_text:'log10(100)=?', options:['1','2','10','100'], correct_answer:'2', solution:'10²=100.', tags:['log']},
  { subject:'Mathematics', chapter:'Series', difficulty:'Hard', type:'MCQ', question_text:'Sum of first n natural numbers:', options:['n(n+1)/2','n²','n(n-1)/2','n³'], correct_answer:'n(n+1)/2', solution:'Formula.', tags:['series']},
];

const seedDatabase = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a seed instructor
    let instructor = await User.findOne({ email: 'instructor@jee.com' });
    if (!instructor) {
      instructor = await User.create({
        name: 'JEE Instructor',
        email: 'instructor@jee.com',
        password: 'Instructor@123',
        role: 'instructor',
      });
      console.log('👨‍🏫 Seed instructor created: instructor@jee.com / Instructor@123');
    }

    // Create a seed student
    let student = await User.findOne({ email: 'student@jee.com' });
    if (!student) {
      student = await User.create({
        name: 'JEE Student',
        email: 'student@jee.com',
        password: 'Student@123',
        role: 'student',
      });
      console.log('👨‍🎓 Seed student created: student@jee.com / Student@123');
    }

    // Clear existing questions
    await Question.deleteMany({});
    console.log('🗑️ Cleared existing questions');

    const allQuestions = [
      ...physicsQuestions.map(q => ({ ...q, createdBy: instructor._id })),
      ...chemistryQuestions.map(q => ({ ...q, createdBy: instructor._id })),
      ...mathQuestions.map(q => ({ ...q, createdBy: instructor._id })),
    ];

    await Question.insertMany(allQuestions);
    console.log(`✅ Seeded ${allQuestions.length} questions:`);
    console.log(`   - Physics: ${physicsQuestions.length}`);
    console.log(`   - Chemistry: ${chemistryQuestions.length}`);
    console.log(`   - Mathematics: ${mathQuestions.length}`);
    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Student  → student@jee.com     / Student@123');
    console.log('   Instructor → instructor@jee.com / Instructor@123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
