export const parseResume = async (file: File) => {
  // For now mock parsing (industry standard flow)
  return {
    personalInfo: {
      fullName: 'Smita Yadav',
      email: '960smita@gmail.com',
      mobile: '829150xxxx',
    },
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
    education: [
      {
        degree: 'B.E Computer Engineering',
        institution: 'SLRTCE',
        startDate: '2022',
        endDate: '2026',
      },
    ],
  };
};
