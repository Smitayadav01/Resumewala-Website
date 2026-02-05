interface Props {
  personal: boolean;
  experience: boolean;
  education: boolean;
  skills: boolean;
  resume: boolean;
}

export default function ProfileChecklist({
  personal,
  experience,
  education,
  skills,
  resume,
}: Props) {

  const items = [
    { label: 'Add personal details', done: personal },
    { label: 'Add experience', done: experience },
    { label: 'Add education', done: education },
    { label: 'Add skills', done: skills },
    { label: 'Upload resume', done: resume },
  ];

  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="font-semibold mb-3">Profile Checklist</h3>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.label}
            className={`text-sm flex justify-between ${
              item.done ? 'text-green-600' : 'text-gray-600'
            }`}
          >
            {item.label}
            {item.done && '✓'}
          </li>
        ))}
      </ul>
    </div>
  );
}
