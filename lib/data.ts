export const STUDENTS = [
    { id: "s1", name: "Mariem Konzani", classId: "c1", parentId: "p1", photo: "https://i.pravatar.cc/150?u=s1", status: "Actif" },
    { id: "s2", name: "Mohamed Ayoub El Jebri", classId: "c1", parentId: "p2", photo: "https://i.pravatar.cc/150?u=s2", status: "Actif" },
    { id: "s3", name: "Sandra Aouini", classId: "c2", parentId: "p3", photo: "https://i.pravatar.cc/150?u=s3", status: "Absent" },
    { id: "s4", name: "Amen Allah Hajlaoui", classId: "c2", parentId: "p4", photo: "https://i.pravatar.cc/150?u=s4", status: "Actif" },
    { id: "s5", name: "Mohamed Hamza El Andolsi", classId: "c3", parentId: "p1", photo: "https://i.pravatar.cc/150?u=s5", status: "Actif" }, // Sibling of s1
];

export const PARENTS = [
    { id: "p1", name: "Ahmed Konzani", email: "ahmed.k@email.com", phone: "06 12 34 56 78", childrenIds: ["s1", "s5"] },
    { id: "p2", name: "Fatima El Jebri", email: "fatima.e@email.com", phone: "06 98 76 54 32", childrenIds: ["s2"] },
    { id: "p3", name: "Youssef Aouini", email: "youssef.a@email.com", phone: "06 11 22 33 44", childrenIds: ["s3"] },
    { id: "p4", name: "Leila Hajlaoui", email: "leila.h@email.com", phone: "06 55 66 77 88", childrenIds: ["s4"] },
];

export const CLASSES = [
    { id: "c1", name: "2ème Année A", teacherId: "t1", level: 2, studentCount: 24, room: "Salle 101" },
    { id: "c2", name: "2ème Année B", teacherId: "t2", level: 2, studentCount: 22, room: "Salle 102" },
    { id: "c3", name: "3ème Année A", teacherId: "t1", level: 3, studentCount: 20, room: "Labo 1" },
    { id: "c4", name: "4ème Année / Bac", teacherId: "t3", level: 4, studentCount: 18, room: "Salle 203" },
];

export const ROOMS = [
    { id: "r1", name: "Salle 101", type: "Classroom", capacity: 30, status: "Available" },
    { id: "r2", name: "Salle 102", type: "Classroom", capacity: 30, status: "Occupied" },
    { id: "r3", name: "Labo 1", type: "Laboratory", capacity: 20, status: "Maintenance" },
    { id: "r4", name: "Salle 203", type: "Classroom", capacity: 25, status: "Available" },
    { id: "r5", name: "Amphithéâtre A", type: "Amphitheater", capacity: 100, status: "Available" },
];

export const TEACHERS = [
    { id: "t1", name: "M. Dupont", subject: "Mathématiques", photo: "https://i.pravatar.cc/150?u=t1" },
    { id: "t2", name: "Mme. Martin", subject: "Français", photo: "https://i.pravatar.cc/150?u=t2" },
    { id: "t3", name: "M. Ben Ali", subject: "Physique", photo: "https://i.pravatar.cc/150?u=t3" },
];
