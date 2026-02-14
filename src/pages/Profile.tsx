import { useEffect, useState } from 'react';
import {
  User,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  Save,
  Upload,
  CheckCircle,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { toast } from "sonner";

interface ProfileProps {
  onNavigate: (page: string) => void;
  resumeData?: any;
}

interface PersonalInfo {
  fullName: string;
  gender: string;
  dob: string;
  age: string;
  city: string;
  email: string;
  currentStatus: string;
  totalExperience: string;
  currentJobTitle: string;
  companyName: string;
  industry: string;
  designation: string;
  currentCTC: string;
  location: string;
  preferredLocation: string;
  employmentType: string;
  workMode: string;
  highestQualification: string;
  college: string;
  yearOfPassing: string;
}


type SectionKey = 'personal' | 'experience' | 'education' | 'skills';

/* ---------------- MAIN ---------------- */
export default function Profile({ resumeData, onNavigate }: ProfileProps) {
  const [activeSection, setActiveSection] = useState<SectionKey | null>('personal');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [profileVisible, setProfileVisible] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const { profile } = useProfile();


  /* PERSONAL */

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: '',
    gender: '',
    dob: '',
    age: '',
    city: '',
    email: '',
    currentStatus: '',
    totalExperience: '',
    currentJobTitle: '',
    companyName: '',
    industry: '',
    designation: '',
    currentCTC: '',
    location: '',
    preferredLocation: '',
    employmentType: '',
    workMode: '',
    highestQualification: '',
    college: '',
    yearOfPassing: '',
  });

  /* EXPERIENCE */
  const [experiences, setExperiences] = useState<any[]>([]);
  const [showExpForm, setShowExpForm] = useState(false);
  const [newExp, setNewExp] = useState({
    company: '',
    position: '',
    employmentType: '',
    location: '',
    startDate: '',
    endDate: '',
    currentlyWorking: false,
    noticePeriod: '',
    skillsUsed: '',
    description: '',
  });

  /* EDUCATION */
  const [education, setEducation] = useState<any[]>([]);
  const [showEduForm, setShowEduForm] = useState(false);
  const [newEdu, setNewEdu] = useState({
    institution: '',
    university: '',
    degree: '',
    fieldOfStudy: '',
    educationType: '',
    startDate: '',
    endDate: '',
    currentlyStudying: false,
    grade: '',
  });

  /* SKILLS */
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  /* ---------------- AUTO FILL ---------------- */
  useEffect(() => {
    if (!resumeData) return;
    resumeData.personalInfo && setPersonalInfo(resumeData.personalInfo);
    resumeData.experiences && setExperiences(resumeData.experiences);
    resumeData.education && setEducation(resumeData.education);
    resumeData.skills && setSkills(resumeData.skills);
  }, [resumeData]);

  useEffect(() => {
    if (!profile) return;

    if (profile.personal) {
      setPersonalInfo(prev => ({ ...prev, ...profile.personal }));
    }

    if (Array.isArray(profile.experience)) {
      setExperiences(profile.experience);
    }

    if (Array.isArray(profile.education)) {
      setEducation(profile.education);
    }

    if (Array.isArray(profile.skills)) {
      setSkills(profile.skills);
    }

    if (typeof profile.profileVisible === "boolean") {
      setProfileVisible(profile.profileVisible);
    }
  }, [profile]);


  useEffect(() => {
    console.log(profile)
  }, [profile])
  /* ---------------- HELPERS ---------------- */
  const toggleSection = (key: SectionKey) =>
    setActiveSection(activeSection === key ? null : key);

  const saveSection = async (section: SectionKey, data: any) => {
    const token = localStorage.getItem("token");

    const payload: any = {};
    payload[section] = data;

    const res = await fetch("http://localhost:5000/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      toast.error("Failed to save section");
      return;
    }

    toast.success("Section saved successfully");
  };


  /* ---------------- ADDERS (FIXED) ---------------- */
  const addExperience = async () => {
    const updated = [...experiences, { ...newExp, id: Date.now() }];
    setExperiences(updated);
    setShowExpForm(false);
    await saveSection('experience', updated);
  };

  const addEducation = async () => {
    const updated = [...education, { ...newEdu, id: Date.now() }];
    setEducation(updated);
    setShowEduForm(false);
    await saveSection('education', updated);
  };

  const addSkill = async () => {
    if (!newSkill || skills.includes(newSkill)) return;
    const updated = [...skills, newSkill];
    setSkills(updated);
    setNewSkill('');
    await saveSection('skills', updated);
  };


  /* ---------------- COMPLETION ---------------- */
  const completion =
    (personalInfo.fullName ? 25 : 0) +
    (experiences.length ? 25 : 0) +
    (education.length ? 25 : 0) +
    (skills.length ? 25 : 0);

  useEffect(() => {
    if (completion === 100) {
      setShowFinalPopup(true);
    }
  }, [completion]);



  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">

          {/* HEADER */}
          <div className="bg-white border rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              {/* LEFT : AVATAR + INFO */}
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow">
                  {personalInfo.fullName?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                {/* Name & Details */}
                <div className="flex flex-col justify-center">
                  <h1 className="text-xl font-semibold leading-tight text-gray-900">
                    {personalInfo.fullName || 'Your Name'}
                  </h1>

                  <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-600 mt-1">
                    <span>{personalInfo.email || 'your@email.com'}</span>
                    {/* <span>{personalInfo.mobile || '+91 XXXXXXXX'}</span> */}
                  </div>
                </div>
              </div>

              {/* RIGHT : VISIBILITY */}
              <button
                onClick={() => setProfileVisible(!profileVisible)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition self-start sm:self-center"
              >
                {profileVisible ? (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Visible to recruiters</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Profile hidden</span>
                  </>
                )}
              </button>

            </div>
          </div>


          {/* PERSONAL */}
          <Accordion title="Basic Information" icon={<User />} open={activeSection === 'personal'} onToggle={() => toggleSection('personal')}>
            <Grid>

              <Input
                label="Full Name"
                value={personalInfo.fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, fullName: e.target.value })
                }
              />

              <Input
                label="Gender"
                value={personalInfo.gender}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, gender: e.target.value })
                }
              />

              <Input
                label="Date of Birth"
                type="date"
                value={personalInfo.dob}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, dob: e.target.value })
                }
              />

              <Input
                label="Age"
                value={personalInfo.age}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, age: e.target.value })
                }
              />

              <Input
                label="City"
                value={personalInfo.city}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, city: e.target.value })
                }
              />

              <Input
                label="Email"
                type="email"
                value={personalInfo.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, email: e.target.value })
                }
              />

              <Input
                label="Current Status"
                type="select"
                value={personalInfo.currentStatus}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, currentStatus: e.target.value })
                }
                options={[
                  { label: 'Select Current Status', value: '' },
                  { label: 'Fresher', value: 'Fresher' },
                  { label: 'Employed', value: 'Employed' },
                  { label: 'Unemployed', value: 'Unemployed' },
                ]}
              />


              <Input
                label="Total Experience"
                value={personalInfo.totalExperience}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, totalExperience: e.target.value })
                }
              />

              <Input
                label="Current Job Title"
                value={personalInfo.currentJobTitle}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, currentJobTitle: e.target.value })
                }
              />

              <Input
                label="Company Name"
                value={personalInfo.companyName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, companyName: e.target.value })
                }
              />

              <Input
                label="Industry"
                value={personalInfo.industry}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, industry: e.target.value })
                }
              />

              <Input
                label="Designation"
                value={personalInfo.designation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, designation: e.target.value })
                }
              />

              <Input
                label="Current CTC"
                value={personalInfo.currentCTC}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, currentCTC: e.target.value })
                }
              />

              <Input
                label="Current Location"
                value={personalInfo.location}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, location: e.target.value })
                }
              />

              <Input
                label="Preferred Location"
                value={personalInfo.preferredLocation}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, preferredLocation: e.target.value })
                }
              />

              <Input
                label="Employment Type"
                type="select"
                value={personalInfo.employmentType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPersonalInfo({ ...personalInfo, employmentType: e.target.value })
                }
                options={[
                  { label: 'Select Employment Type', value: '' },
                  { label: 'Full-time', value: 'Full-time' },
                  { label: 'Part-time', value: 'Part-time' },
                  { label: 'Contract', value: 'Contract' },
                ]}
              />

              <Input
                label="Work Mode"
                type="select"
                value={personalInfo.workMode}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setPersonalInfo({ ...personalInfo, workMode: e.target.value })
                }
                options={[
                  { label: 'Select Work Mode', value: '' },
                  { label: 'On-site', value: 'On-site' },
                  { label: 'Hybrid', value: 'Hybrid' },
                  { label: 'Remote', value: 'Remote' },
                ]}
              />


              <Input
                label="Highest Qualification"
                value={personalInfo.highestQualification}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, highestQualification: e.target.value })
                }
              />

              <Input
                label="College / University"
                value={personalInfo.college}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, college: e.target.value })
                }
              />

              <Input
                label="Year of Passing"
                value={personalInfo.yearOfPassing}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPersonalInfo({ ...personalInfo, yearOfPassing: e.target.value })
                }
              />

            </Grid>
            <SaveBtn onClick={() => saveSection('personal', personalInfo)} />
          </Accordion>

          {/* EXPERIENCE */}
          <Accordion
            title="Experience"
            icon={<Briefcase />}
            open={activeSection === 'experience'}
            onToggle={() => toggleSection('experience')}
          >
            {experiences.map((exp) => (
              <Card key={exp.id}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{exp.position}</h3>
                    <p className="text-sm text-blue-600">{exp.company}</p>
                    <p className="text-xs text-gray-500">
                      {exp.employmentType} • {exp.location}
                    </p>
                  </div>

                  <Trash2
                    className="cursor-pointer text-red-500"
                    onClick={() =>
                      setExperiences(experiences.filter((e) => e.id !== exp.id))
                    }
                  />
                </div>
              </Card>
            ))}

            {showExpForm && (
              <Form>
                <Grid>
                  <Input
                    label="Company"
                    value={newExp.company}
                    onChange={(e: any) =>
                      setNewExp({ ...newExp, company: e.target.value })
                    }
                  />
                  <Input
                    label="Position"
                    value={newExp.position}
                    onChange={(e: any) =>
                      setNewExp({ ...newExp, position: e.target.value })
                    }
                  />
                  <Input
                    label="Employment Type"
                    value={newExp.employmentType}
                    onChange={(e: any) =>
                      setNewExp({ ...newExp, employmentType: e.target.value })
                    }
                  />
                  <Input
                    label="Location"
                    value={newExp.location}
                    onChange={(e: any) =>
                      setNewExp({ ...newExp, location: e.target.value })
                    }
                  />
                  <Input
                    label="Start Date"
                    type="date"
                    value={newExp.startDate}
                    onChange={(e: any) =>
                      setNewExp({ ...newExp, startDate: e.target.value })
                    }
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={newExp.endDate}
                    onChange={(e: any) =>
                      setNewExp({ ...newExp, endDate: e.target.value })
                    }
                  />
                  <Input
                    label="Notice Period"
                    value={newExp.noticePeriod}
                    onChange={(e: any) =>
                      setNewExp({ ...newExp, noticePeriod: e.target.value })
                    }
                  />
                  <Input
                    label="Skills Used"
                    full
                    value={newExp.skillsUsed}
                    onChange={(e: any) =>
                      setNewExp({ ...newExp, skillsUsed: e.target.value })
                    }
                  />
                  <Input
                    label="Description"
                    full
                    value={newExp.description}
                    onChange={(e: any) =>
                      setNewExp({ ...newExp, description: e.target.value })
                    }
                  />
                </Grid>

                <SaveBtn onClick={addExperience} />
              </Form>
            )}

            <AddBtn onClick={() => setShowExpForm(true)} />
          </Accordion>

          {/* EDUCATION */}
          <Accordion
            title="Education"
            icon={<GraduationCap />}
            open={activeSection === 'education'}
            onToggle={() => toggleSection('education')}
          >
            {education.map((edu) => (
              <Card key={edu.id}>
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-sm text-blue-600">{edu.institution}</p>
                  </div>

                  <Trash2
                    className="cursor-pointer text-red-500"
                    onClick={() =>
                      setEducation(education.filter((e) => e.id !== edu.id))
                    }
                  />
                </div>
              </Card>
            ))}

            {showEduForm && (
              <Form>
                <Grid>
                  <Input
                    label="Institution"
                    value={newEdu.institution}
                    onChange={(e: any) =>
                      setNewEdu({ ...newEdu, institution: e.target.value })
                    }
                  />
                  <Input
                    label="University / Board"
                    value={newEdu.university}
                    onChange={(e: any) =>
                      setNewEdu({ ...newEdu, university: e.target.value })
                    }
                  />
                  <Input
                    label="Degree"
                    value={newEdu.degree}
                    onChange={(e: any) =>
                      setNewEdu({ ...newEdu, degree: e.target.value })
                    }
                  />
                  <Input
                    label="Field of Study"
                    value={newEdu.fieldOfStudy}
                    onChange={(e: any) =>
                      setNewEdu({ ...newEdu, fieldOfStudy: e.target.value })
                    }
                  />
                  <Input
                    label="Education Type"
                    value={newEdu.educationType}
                    onChange={(e: any) =>
                      setNewEdu({ ...newEdu, educationType: e.target.value })
                    }
                  />
                  <Input
                    label="Start Date"
                    type="date"
                    value={newEdu.startDate}
                    onChange={(e: any) =>
                      setNewEdu({ ...newEdu, startDate: e.target.value })
                    }
                  />
                  <Input
                    label="End Date"
                    type="date"
                    value={newEdu.endDate}
                    onChange={(e: any) =>
                      setNewEdu({ ...newEdu, endDate: e.target.value })
                    }
                  />
                  <Input
                    label="Grade / CGPA"
                    value={newEdu.grade}
                    onChange={(e: any) =>
                      setNewEdu({ ...newEdu, grade: e.target.value })
                    }
                  />
                </Grid>

                <SaveBtn onClick={addEducation} />
              </Form>
            )}

            <AddBtn onClick={() => setShowEduForm(true)} />
          </Accordion>

          {/* SKILLS */}
          <Accordion
            title="Skills"
            icon={<Briefcase />}
            open={activeSection === 'skills'}
            onToggle={() => toggleSection('skills')}
          >
            {/* ADD SKILL */}
            <div className="flex gap-3 mb-4">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g. React, Java)"
                className="border rounded-lg px-4 py-2 flex-1"
              />
              <SaveBtn onClick={addSkill} />
            </div>

            {/* SHOW SKILLS */}
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full border"
                  >
                    <span className="text-sm font-medium">{skill}</span>

                    <Trash2
                      className="h-4 w-4 cursor-pointer text-red-500"
                      onClick={async () => {
                        const updated = skills.filter((_, i) => i !== index);
                        setSkills(updated);
                        await saveSection('skills', updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No skills added yet</p>
            )}
          </Accordion>

        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          <div className="bg-white border rounded-xl p-5">
            <h3 className="font-semibold mb-2">Profile Strength</h3>
            <div className="bg-gray-200 h-2 rounded-full">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${completion}%` }} />
            </div>
            <p className="text-sm mt-1">{completion}% complete</p>
          </div>

          <div className="bg-white border rounded-xl p-5">
            <label className="border-dashed border-2 rounded-lg p-4 block text-center cursor-pointer">
              <Upload className="mx-auto mb-2 text-blue-600" />
              <p className="text-sm">{resumeFile?.name || 'Upload Resume'}</p>
              <input type="file" hidden onChange={(e: any) => setResumeFile(e.target.files?.[0])} />
            </label>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl text-center">
            <CheckCircle className="text-green-600 mx-auto mb-2" />
            Section saved successfully
          </div>
        </div>
      )}

      {showFinalPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[90%] max-w-md text-center shadow-xl">
            <CheckCircle className="text-green-600 h-14 w-14 mx-auto mb-4" />

            <h2 className="text-xl font-semibold mb-2">
              Profile Updated Successfully 🎉
            </h2>

            <p className="text-gray-600 mb-6">
              Your profile is now complete. You can now browse and apply for jobs.
            </p>

            <button
              onClick={() => {
                setShowFinalPopup(false);
                onNavigate('jobs');
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Browse Jobs
            </button>
          </div>
        </div>
      )}


    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */
const Accordion = ({ title, icon, open, onToggle, children }: any) => (
  <div className="bg-white border rounded-xl">
    <button onClick={onToggle} className="w-full flex justify-between p-6">
      <div className="flex gap-3 text-blue-600 font-semibold">{icon} {title}</div>
      <ChevronDown className={open ? 'rotate-180' : ''} />
    </button>
    {open && <div className="px-6 pb-6">{children}</div>}
  </div>
);

const Grid = ({ children }: any) => <div className="grid md:grid-cols-2 gap-5">{children}</div>;
const Input = ({ label, type = 'text', options = [], full, ...props }: any) => (
  <div className={full ? 'md:col-span-2' : ''}>
    <label className="text-sm font-medium">{label}</label>

    {type === 'select' ? (
      <select
        {...props}
        className="w-full mt-1 border rounded-lg px-4 py-2 bg-white"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        {...props}
        className="w-full mt-1 border rounded-lg px-4 py-2"
      />
    )}
  </div>
);

const Card = ({ children }: any) => <div className="border rounded-lg p-4 mb-4">{children}</div>;
const AddBtn = ({ onClick }: any) => <button onClick={onClick} className="text-blue-600 mt-3 flex gap-1"><Plus /> Add</button>;
const SaveBtn = ({ onClick }: any) => <button onClick={onClick} className="bg-blue-600 text-white px-6 py-2 rounded-lg flex gap-2 mt-4"><Save /> Save</button>;
const Form = ({ children }: any) => <div className="bg-gray-50 border rounded-lg p-4 space-y-4">{children}</div>;
