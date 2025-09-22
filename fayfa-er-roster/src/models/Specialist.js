// Specialist model for consultant specialists (not ER doctors)
class Specialist {
  constructor(id, name, email, phone, department) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.department = department; // e.g., General Surgery, Pediatrics, ENT
    this.createdAt = new Date();
  }
}

// In-memory storage for specialists
const specialistsData = [
  // General Surgery
  new Specialist(1, 'Dr. Renaldo', 'renaldo@fayfa.hospital', '+966501234601', 'General Surgery'),
  new Specialist(2, 'Dr. Mammoun', 'mammoun@fayfa.hospital', '+966501234602', 'General Surgery'),
  
  // Pediatrics
  new Specialist(3, 'Dr. Mahmoud Badawy', 'badawy@fayfa.hospital', '+966501234603', 'Pediatrics'),
  
  // Internal Medicine
  new Specialist(4, 'Dr. Fathi', 'fathi@fayfa.hospital', '+966501234604', 'Internal Medicine'),
  
  // Ophthalmology
  new Specialist(5, 'Dr. Yanelis', 'yanelis@fayfa.hospital', '+966501234605', 'Ophthalmology'),
  
  // ENT
  new Specialist(6, 'Dr. Mahasen', 'mahasen@fayfa.hospital', '+966501234606', 'ENT'),
  
  // Anesthesia
  new Specialist(7, 'Dr. Julio', 'julio@fayfa.hospital', '+966501234607', 'Anesthesia'),
  
  // Obstetrics & Gynaecology
  new Specialist(8, 'Dr. Frazana', 'frazana@fayfa.hospital', '+966501234608', 'Obstetrics & Gynaecology'),
  new Specialist(9, 'Dr. Asma', 'asma@fayfa.hospital', '+966501234609', 'Obstetrics & Gynaecology'),
  
  // Nephrology
  new Specialist(10, 'Dr. Abdulraouf', 'abdulraouf@fayfa.hospital', '+966501234610', 'Nephrology')
];

// Static methods
Specialist.getAll = () => [...specialistsData];

Specialist.findById = (id) => specialistsData.find(specialist => specialist.id === parseInt(id));

Specialist.findByDepartment = (department) => 
  specialistsData.filter(specialist => specialist.department === department);

Specialist.add = (specialistData) => {
  const newId = Math.max(...specialistsData.map(s => s.id), 0) + 1;
  const newSpecialist = new Specialist(
    newId,
    specialistData.name,
    specialistData.email,
    specialistData.phone,
    specialistData.department
  );
  specialistsData.push(newSpecialist);
  return newSpecialist;
};

Specialist.update = (id, updates) => {
  const index = specialistsData.findIndex(s => s.id === parseInt(id));
  if (index !== -1) {
    specialistsData[index] = { ...specialistsData[index], ...updates };
    return specialistsData[index];
  }
  return null;
};

Specialist.delete = (id) => {
  const index = specialistsData.findIndex(s => s.id === parseInt(id));
  if (index !== -1) {
    const deleted = specialistsData.splice(index, 1);
    return deleted[0];
  }
  return null;
};

// Get all unique departments
Specialist.getDepartments = () => {
  const departments = new Set(specialistsData.map(s => s.department));
  return Array.from(departments).sort();
};

module.exports = Specialist;