export const USERS = [
    { login: "admin", password: "admin", role: "admin", idTeach: "" },
    { login: "prof", password: "prof", role: "prof", idTeach: "t1" },
    { login: "1234", password: "1234", role: "prof", idTeach: "t2" },
    { login: "1234", password: "1234", role: "prof", idTeach: "t3" },
];
export const STUDENTS = [
    { id: "s1", firstName: "Mariem", lastName: "Konzani", idenelev: "ELE001", classId: "c1", parentId: "p1", photo: "fille.jfif", status: "Actif", address: "123 Rue de la Liberté, Tunis", phone: "55123456", gender: "f" },
    { id: "s2", firstName: "Mohamed Ayoub", lastName: "El Jebri", idenelev: "ELE002", classId: "c1", parentId: "p2", photo: "garcon.jfif", status: "Actif", address: "45 Avenue Habib Bourguiba, Ariana", phone: "22334455", gender: "m" },
    { id: "s3", firstName: "Sandra", lastName: "Aouini", idenelev: "ELE003", classId: "c2", parentId: "p3", photo: "fille.jfif", status: "Absent", address: "12 Rue des Oliviers, Marsa", phone: "98765432", gender: "f" },
    { id: "s4", firstName: "Amen Allah", lastName: "Hajlaoui", idenelev: "ELE004", classId: "c3", parentId: "p4", photo: "garcon.jfif", status: "Actif", address: "78 Boulevard du 14 Janvier, Sfax", phone: "50112233", gender: "m" },
    { id: "s5", firstName: "Mohamed Hamza", lastName: "El Andolsi", idenelev: "ELE005", classId: "c4", parentId: "p1", photo: "garcon.jfif", status: "Actif", address: "123 Rue de la Liberté, Tunis", phone: "55123456", gender: "m" }, // Sibling of s1
];

export const PARENTS = [
    { id: "p1", name: "Ahmed Konzani", email: "ahmed.k@email.com", phone: "06 12 34 56 78", childrenIds: ["s1", "s5"], username: "ahmed.konzani", password: "password123" },
    { id: "p2", name: "Fatima El Jebri", email: "fatima.e@email.com", phone: "06 98 76 54 32", childrenIds: ["s2"], username: "fatima.jebri", password: "password123" },
    { id: "p3", name: "Youssef Aouini", email: "youssef.a@email.com", phone: "06 11 22 33 44", childrenIds: ["s3"], username: "youssef.aouini", password: "password123" },
    { id: "p4", name: "Leila Hajlaoui", email: "leila.h@email.com", phone: "06 55 66 77 88", childrenIds: ["s4"], username: "leila.hajlaoui", password: "password123" },
];

export const CLASSES = [
    { id: "c1", name: "7ème B 1", level: 1 },
    { id: "c2", name: "7ème B 2", level: 1 },
    { id: "c3", name: "8ème B 1", level: 2 },
    { id: "c4", name: "9ème B 1", level: 3 },
];

export const ROOMS = [
    { id: "r1", name: "Salle 101", type: "Classroom", capacity: 30, status: "Available" },
    { id: "r2", name: "Salle 102", type: "Classroom", capacity: 30, status: "Available" },
    { id: "r3", name: "Info 1", type: "Laboratory", capacity: 20, status: "Maintenance" },
    { id: "r4", name: "Salle 203", type: "Classroom", capacity: 25, status: "Available" },
    { id: "r5", name: "Cinema", type: "Amphitheater", capacity: 100, status: "Available" },
];

export const TEACHERS = [
    { id: "t1", name: "M. Dupont", subject: "Mathématiques", photo: "homme.png", iuense: "ENS001", email: "dupont@ecole.com", phone: "98111222", diploma: "Mastère en Mathématiques", gender: "m" },
    { id: "t2", name: "Mme. Martin", subject: "Français", photo: "femme.png", iuense: "ENS002", email: "martin@ecole.com", phone: "55333444", diploma: "CAPES Français", gender: "f" },
    { id: "t3", name: "M. Ben Ali", subject: "Physique", photo: "homme.png", iuense: "ENS003", email: "benali@ecole.com", phone: "22555666", diploma: "Doctorat en Physique", gender: "m" },
];
