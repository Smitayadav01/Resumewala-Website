interface Props {
  visible: boolean;
  onChange: (v: boolean) => void;
}

export default function VisibilityToggle({ visible, onChange }: Props) {
  return (
    <div className="bg-white border rounded-xl p-4">
      <h3 className="font-semibold mb-2">Profile Visibility</h3>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={visible}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="text-sm">
          {visible
            ? 'Visible to recruiters'
            : 'Hidden from recruiters'}
        </span>
      </label>
    </div>
  );
}
