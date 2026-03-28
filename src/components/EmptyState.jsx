const EmptyState = () => {
  return (
    <section className="rounded-[28px] border border-slate-200/70 bg-white/85 p-10 text-center shadow-soft backdrop-blur">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-slate-900 text-2xl font-bold text-white">
        DL
      </div>
      <h3 className="mt-6 font-display text-3xl text-slate-900">Start with a CSV and let DataLens do the setup work.</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
        This first phase is about momentum. Upload a file, validate the structure, and instantly preview the dataset so the rest of the product feels fast and trustworthy.
      </p>
    </section>
  )
}

export default EmptyState
