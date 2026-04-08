function PatientHeader() {
  return (
    <div className="border-b border-slate-200 px-8 py-5 bg-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Porter, Stephen D
          </h1>
          <div className="text-sm text-slate-500 mt-1">
            MRN: M000139 • Admission ID: A000172
          </div>
        </div>

        <div className="text-sm text-slate-600 text-right">
          <div>Age: 57</div>
          <div>Male</div>
        </div>
      </div>
    </div>
  );
}

export default PatientHeader;
