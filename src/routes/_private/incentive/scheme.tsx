import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { asConfigByKey } from "#/config/config-content";
import {
  asPageByKey,
  type IncentiveViewCurrency,
  type IncentiveViewPeriod,
} from "#/config/pages-content";

export const Route = createFileRoute("/_private/incentive/scheme")({
  component: IncentiveScheme,
  loader: async ({ context }) => {
    const row = await context.queryClient.ensureQueryData(
      context.trpc.pages.get.queryOptions({ key: "incentive::scheme" })
    );
    if (!row) {
      throw new Error("Missing page content: incentive::scheme");
    }
    const config = await context.queryClient.ensureQueryData(
      context.trpc.config.get.queryOptions({ key: "salary" })
    );
    if (!config) {
      throw new Error("Missing salary config");
    }
    return {
      page: asPageByKey("incentive::scheme", row.value),
      config: asConfigByKey("salary", config.value),
    };
  },
});

function replaceTemplate(
  template: string,
  vars: Record<string, string | number>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
    vars[key] !== undefined && vars[key] !== null ? String(vars[key]) : ""
  );
}

function IncentiveScheme() {
  const { page, config } = Route.useLoaderData();
  const fx = page.fx.hkdPerUsd;

  const [viewCurrency, setViewCurrency] =
    useState<IncentiveViewCurrency>("HKD");
  const [viewPeriod, setViewPeriod] = useState<IncentiveViewPeriod>("Monthly");

  const sortedJobs = useMemo(
    () =>
      Object.entries(config.baseJobCosts).sort(
        ([, costA], [, costB]) => costA - costB
      ),
    [config.baseJobCosts]
  );

  const experienceIds = useMemo(
    () =>
      page.growth.experience.levels
        .map((l) => l.id)
        .filter((id) => id in config.experienceMultipliers),
    [page.growth.experience.levels, config.experienceMultipliers]
  );

  const beltIds = useMemo(
    () =>
      page.growth.belts.items
        .map((i) => i.id)
        .filter((id) => id in config.beltMultipliers),
    [page.growth.belts.items, config.beltMultipliers]
  );

  const experienceLevelById = useMemo(() => {
    const m = new Map<string, string>();
    for (const l of page.growth.experience.levels) {
      m.set(l.id, l.description);
    }
    return m;
  }, [page.growth.experience.levels]);

  const beltItemById = useMemo(() => {
    const m = new Map<string, string>();
    for (const i of page.growth.belts.items) {
      m.set(i.id, i.description);
    }
    return m;
  }, [page.growth.belts.items]);

  const sortedExperienceRows = useMemo(
    () =>
      experienceIds
        .map((id) => ({
          id,
          multiplier: config.experienceMultipliers[id] ?? 0,
          description: experienceLevelById.get(id) ?? "",
        }))
        .sort((a, b) => a.multiplier - b.multiplier),
    [experienceIds, config.experienceMultipliers, experienceLevelById]
  );

  const sortedBeltRows = useMemo(
    () =>
      beltIds
        .map((id) => ({
          id,
          multiplier: config.beltMultipliers[id] ?? 1,
          description: beltItemById.get(id) ?? "",
        }))
        .sort((a, b) => a.multiplier - b.multiplier),
    [beltIds, config.beltMultipliers, beltItemById]
  );

  const [calcJob, setCalcJob] = useState(
    () => sortedJobs[0]?.[0] ?? "Engineer"
  );
  const [calcExp, setCalcExp] = useState(() =>
    experienceIds.includes("Junior") ? "Junior" : (experienceIds[0] ?? "Junior")
  );
  const [calcBelt, setCalcBelt] = useState(() =>
    beltIds.includes("Yellow") ? "Yellow" : (beltIds[0] ?? "Yellow")
  );
  const [calcLocation, setCalcLocation] = useState(
    () => page.calculator.locations[0] ?? "Hong Kong"
  );
  const [calcEmployment, setCalcEmployment] = useState(
    () => page.calculator.employmentTypes[0] ?? "Employee"
  );

  const formatCurrency = (amount: number) => {
    let val = amount;
    if (viewPeriod === "Monthly") val /= 12;
    if (viewCurrency === "USD") val /= fx;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: viewCurrency,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const mpfTotalAnnual =
    config.otherParameters.mpfEmployerMax +
    config.otherParameters.mpfEmployeeMax;

  const periodWord =
    viewPeriod === "Monthly"
      ? page.viewControls.period.monthly.toLowerCase()
      : page.viewControls.period.yearly.toLowerCase();

  const employerCostHeader = replaceTemplate(
    page.roles.table.employerCostHeaderTemplate,
    {
      period: viewPeriod,
      currency: viewCurrency,
    }
  );

  const traineeNote = replaceTemplate(page.roles.traineeNoteTemplate, {
    amount: formatCurrency(page.roles.traineeAnnualNetHkd),
    period: periodWord,
  });

  const breakdownTitle = replaceTemplate(
    page.calculator.breakdownTitleTemplate,
    { period: viewPeriod }
  );

  const netSalaryLabel = replaceTemplate(page.calculator.rows.netSalary, {
    period: viewPeriod,
  });

  const alternatePeriodLabel =
    viewPeriod === "Monthly"
      ? page.viewControls.period.yearly
      : page.viewControls.period.monthly;

  const estimatedAlternateLabel = replaceTemplate(
    page.calculator.rows.estimatedAlternateNetTemplate,
    { alternatePeriod: alternatePeriodLabel }
  );

  const pppMultiplier = calcLocation === "Manila" ? 0.55 : 1.0;
  const baseAnnual = (config.baseJobCosts[calcJob] ?? 0) * pppMultiplier;
  const expAnnual = baseAnnual * (config.experienceMultipliers[calcExp] ?? 0);
  const beltMultiplier = config.beltMultipliers[calcBelt] ?? 1;

  const employerCostAnnual = (baseAnnual + expAnnual) * beltMultiplier;

  const lunchDeductionAnnual =
    calcLocation === "Hong Kong" ? config.otherParameters.foodDeduction : 0;
  const insuranceDeductionAnnual =
    calcEmployment === "Freelance" ? 0 : config.otherParameters.healthInsurance;

  let grossAnnualSalary = 0;
  let netAnnualSalary = 0;
  let mpfDeductionAnnual = 0;

  if (calcEmployment === "Freelance") {
    grossAnnualSalary =
      employerCostAnnual - lunchDeductionAnnual - insuranceDeductionAnnual;
    netAnnualSalary = grossAnnualSalary;
  } else {
    const monthlyEmployerCost = employerCostAnnual / 12;
    const monthlyInsurance = insuranceDeductionAnnual / 12;
    const monthlyLunch = lunchDeductionAnnual / 12;

    let monthlyGross = 0;
    let monthlyNet = 0;
    let monthlyMpfEmployer = 0;
    let monthlyMpfEmployee = 0;

    if (monthlyEmployerCost <= 33900) {
      monthlyGross =
        (monthlyEmployerCost - monthlyInsurance - monthlyLunch) / 1.05;
      monthlyNet = 0.95 * monthlyGross;
      monthlyMpfEmployer = monthlyGross * 0.05;
      monthlyMpfEmployee = monthlyGross * 0.05;
    } else {
      monthlyGross =
        monthlyEmployerCost - monthlyInsurance - monthlyLunch - 1500;
      monthlyNet = monthlyGross - 1500;
      monthlyMpfEmployer = 1500;
      monthlyMpfEmployee = 1500;
    }

    grossAnnualSalary = monthlyGross * 12;
    netAnnualSalary = monthlyNet * 12;
    mpfDeductionAnnual = (monthlyMpfEmployer + monthlyMpfEmployee) * 12;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:px-8 md:py-24">
      <div className="space-y-12 max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white uppercase tracking-tight font-title mb-4">
              {page.header.title}
            </h1>
            <p className="text-xl text-brand-accent font-medium uppercase tracking-wider">
              {page.header.subtitle}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 bg-brand-surface border border-brand-dark p-1">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setViewCurrency("HKD")}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${viewCurrency === "HKD" ? "bg-brand-dark text-white" : "text-brand-gray hover:text-white"}`}
                >
                  {page.viewControls.currency.hkd}
                </button>
                <button
                  type="button"
                  onClick={() => setViewCurrency("USD")}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${viewCurrency === "USD" ? "bg-brand-dark text-white" : "text-brand-gray hover:text-white"}`}
                >
                  {page.viewControls.currency.usd}
                </button>
              </div>
              <div className="w-px h-4 bg-brand-dark" />
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setViewPeriod("Monthly")}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${viewPeriod === "Monthly" ? "bg-brand-dark text-white" : "text-brand-gray hover:text-white"}`}
                >
                  {page.viewControls.period.monthly}
                </button>
                <button
                  type="button"
                  onClick={() => setViewPeriod("Yearly")}
                  className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${viewPeriod === "Yearly" ? "bg-brand-dark text-white" : "text-brand-gray hover:text-white"}`}
                >
                  {page.viewControls.period.yearly}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-12 text-brand-light">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wide border-b border-brand-dark pb-2">
              {page.philosophy.title}
            </h2>
            <p className="text-brand-gray leading-relaxed">
              {page.philosophy.intro}
            </p>
            <ul className="list-disc pl-5 space-y-2 text-brand-gray">
              {page.philosophy.points.map((point) => (
                <li key={point.label}>
                  <strong className="text-white">{point.label}</strong>{" "}
                  {point.text}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wide border-b border-brand-dark pb-2">
              {page.incentive.title}
            </h2>
            <div className="bg-brand-surface border border-brand-dark p-6 text-left">
              <span className="text-2xl font-bold text-brand-accent tracking-widest uppercase">
                {page.incentive.banner}
              </span>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                {page.incentive.equity.subtitle}
              </h3>
              <p className="text-brand-gray leading-relaxed">
                {page.incentive.equity.intro}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-brand-gray">
                {page.incentive.equity.bullets.map((bullet) => (
                  <li key={bullet.label}>
                    <strong className="text-white">{bullet.label}</strong>{" "}
                    {bullet.text}
                    {bullet.criteria && bullet.criteria.length > 0 ? (
                      <ol className="list-decimal pl-5 mt-2 space-y-1">
                        {bullet.criteria.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ol>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                {page.incentive.salary.subtitle}
              </h3>
              <div className="bg-brand-surface border border-brand-dark p-4 font-mono text-sm md:text-base text-left text-brand-accent">
                {page.incentive.salary.formula}
              </div>
              <p className="text-brand-gray leading-relaxed">
                {page.incentive.salary.intro}
              </p>
              <ul className="list-disc pl-5 space-y-2 text-brand-gray">
                <li>
                  <strong className="text-white">
                    {page.incentive.salary.includes.mpf.label}
                  </strong>{" "}
                  {formatCurrency(mpfTotalAnnual)}/
                  {viewPeriod === "Monthly"
                    ? page.viewControls.period.monthly.toLowerCase()
                    : page.viewControls.period.yearly.toLowerCase()}{" "}
                  {page.incentive.salary.includes.mpf.trailing}
                </li>
                <li>
                  <strong className="text-white">
                    {page.incentive.salary.includes.food.label}
                  </strong>{" "}
                  {formatCurrency(config.otherParameters.foodDeduction)}/
                  {viewPeriod === "Monthly"
                    ? page.viewControls.period.monthly.toLowerCase()
                    : page.viewControls.period.yearly.toLowerCase()}{" "}
                  {page.incentive.salary.includes.food.trailing}
                </li>
                <li>
                  <strong className="text-white">
                    {page.incentive.salary.includes.healthInsurance.label}
                  </strong>{" "}
                  {formatCurrency(config.otherParameters.healthInsurance)}/
                  {viewPeriod === "Monthly"
                    ? page.viewControls.period.monthly.toLowerCase()
                    : page.viewControls.period.yearly.toLowerCase()}{" "}
                  {page.incentive.salary.includes.healthInsurance.trailing}
                </li>
                <li>{page.incentive.salary.includes.remainder}</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wide border-b border-brand-dark pb-2">
              {page.roles.title}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-brand-dark">
                    <th className="p-3 text-sm font-bold uppercase tracking-wider text-brand-gray">
                      {page.roles.table.jobHeader}
                    </th>
                    <th className="p-3 text-sm font-bold uppercase tracking-wider text-brand-gray text-right">
                      {employerCostHeader}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedJobs.map(([job, cost]) => (
                    <tr
                      key={job}
                      className="border-b border-brand-dark/50 hover:bg-brand-surface/50 transition-colors"
                    >
                      <td className="p-3 text-white">{job}</td>
                      <td className="p-3 text-brand-accent font-mono text-right">
                        {formatCurrency(cost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-brand-gray italic text-sm mt-4">{traineeNote}</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wide border-b border-brand-dark pb-2">
              {page.growth.title}
            </h2>
            <p className="text-brand-gray leading-relaxed">
              {page.growth.intro}
            </p>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                {page.growth.experience.subtitle}
              </h3>
              <p className="text-brand-gray leading-relaxed">
                {page.growth.experience.intro}
              </p>
              <ul className="space-y-3">
                {sortedExperienceRows.map((row) => (
                  <li
                    key={row.id}
                    className="grid grid-cols-1 md:grid-cols-[140px_180px_1fr] gap-1 md:gap-4 items-start"
                  >
                    <span className="text-white font-semibold">{row.id}</span>
                    <span className="text-brand-accent font-mono text-sm">
                      {replaceTemplate(
                        page.growth.experience.bonusLabelTemplate,
                        { percent: (row.multiplier * 100).toFixed(2) }
                      )}
                    </span>
                    <span className="text-brand-gray">{row.description}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white">
                {page.growth.belts.subtitle}
              </h3>
              <p className="text-brand-gray leading-relaxed">
                {page.growth.belts.intro}
              </p>
              <ul className="space-y-3">
                {sortedBeltRows.map((row) => (
                  <li
                    key={row.id}
                    className="grid grid-cols-1 md:grid-cols-[140px_180px_1fr] gap-1 md:gap-4 items-start"
                  >
                    <span className="text-white font-semibold">{row.id}</span>
                    <span className="text-brand-accent font-mono text-sm">
                      {replaceTemplate(
                        page.growth.belts.multiplierLabelTemplate,
                        { multiplier: row.multiplier }
                      )}
                    </span>
                    <span className="text-brand-gray">{row.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white uppercase tracking-wide border-b border-brand-dark pb-2">
              {page.calculator.title}
            </h2>
            <div className="bg-brand-surface border border-brand-dark p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="incentive-calc-job"
                      className="block text-sm font-bold text-brand-gray uppercase tracking-wider mb-2"
                    >
                      {page.calculator.labels.job}
                    </label>
                    <select
                      id="incentive-calc-job"
                      value={calcJob}
                      onChange={(e) => setCalcJob(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark text-white px-3 py-2 focus:outline-none focus:border-brand-accent"
                    >
                      {sortedJobs.map(([job]) => (
                        <option key={job} value={job}>
                          {job}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="incentive-calc-exp"
                      className="block text-sm font-bold text-brand-gray uppercase tracking-wider mb-2"
                    >
                      {page.calculator.labels.experience}
                    </label>
                    <select
                      id="incentive-calc-exp"
                      value={calcExp}
                      onChange={(e) => setCalcExp(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark text-white px-3 py-2 focus:outline-none focus:border-brand-accent"
                    >
                      {experienceIds.map((exp) => (
                        <option key={exp} value={exp}>
                          {exp}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="incentive-calc-belt"
                      className="block text-sm font-bold text-brand-gray uppercase tracking-wider mb-2"
                    >
                      {page.calculator.labels.belt}
                    </label>
                    <select
                      id="incentive-calc-belt"
                      value={calcBelt}
                      onChange={(e) => setCalcBelt(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark text-white px-3 py-2 focus:outline-none focus:border-brand-accent"
                    >
                      {beltIds.map((belt) => (
                        <option key={belt} value={belt}>
                          {belt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="incentive-calc-location"
                      className="block text-sm font-bold text-brand-gray uppercase tracking-wider mb-2"
                    >
                      {page.calculator.labels.location}
                    </label>
                    <select
                      id="incentive-calc-location"
                      value={calcLocation}
                      onChange={(e) => setCalcLocation(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark text-white px-3 py-2 focus:outline-none focus:border-brand-accent"
                    >
                      {page.calculator.locations.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="incentive-calc-employment"
                      className="block text-sm font-bold text-brand-gray uppercase tracking-wider mb-2"
                    >
                      {page.calculator.labels.employmentType}
                    </label>
                    <select
                      id="incentive-calc-employment"
                      value={calcEmployment}
                      onChange={(e) => setCalcEmployment(e.target.value)}
                      className="w-full bg-brand-bg border border-brand-dark text-white px-3 py-2 focus:outline-none focus:border-brand-accent"
                    >
                      {page.calculator.employmentTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-brand-bg border border-brand-dark p-4 md:p-6">
                <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">
                  {breakdownTitle}
                </h3>
                <ul className="space-y-3 font-mono text-sm md:text-base text-brand-gray">
                  <li className="flex justify-between">
                    <span>{page.calculator.rows.baseSalary}</span>
                    <span className="text-white">
                      {formatCurrency(baseAnnual)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>{page.calculator.rows.experienceAddon}</span>
                    <span className="text-white">
                      +{formatCurrency(expAnnual)}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>{page.calculator.rows.ownershipMultiplier}</span>
                    <span className="text-white">x {beltMultiplier}</span>
                  </li>
                  <li className="flex justify-between pt-3 border-t border-brand-dark font-bold">
                    <span className="text-brand-accent">
                      {page.calculator.rows.totalEmployerCost}
                    </span>
                    <span className="text-brand-accent">
                      {formatCurrency(employerCostAnnual)}
                    </span>
                  </li>

                  <li className="pt-4" />

                  <li className="flex justify-between text-red-400/80">
                    <span>{page.calculator.rows.foodDeduction}</span>
                    <span>-{formatCurrency(lunchDeductionAnnual)}</span>
                  </li>
                  <li className="flex justify-between text-red-400/80">
                    <span>{page.calculator.rows.healthInsurance}</span>
                    <span>-{formatCurrency(insuranceDeductionAnnual)}</span>
                  </li>
                  <li className="flex justify-between text-red-400/80">
                    <span>{page.calculator.rows.mpfContribution}</span>
                    <span>-{formatCurrency(mpfDeductionAnnual)}</span>
                  </li>

                  <li className="flex justify-between pt-3 border-t border-brand-dark font-bold text-lg">
                    <span className="text-emerald-400">{netSalaryLabel}</span>
                    <span className="text-emerald-400">
                      {formatCurrency(netAnnualSalary)}
                    </span>
                  </li>
                </ul>
                <div className="mt-6 pt-4 border-t border-brand-dark flex justify-between font-mono text-sm font-bold">
                  <span className="text-brand-light">
                    {estimatedAlternateLabel}
                  </span>
                  <span className="text-white">
                    {formatCurrency(
                      viewPeriod === "Monthly"
                        ? netAnnualSalary * 12
                        : netAnnualSalary / 12
                    )}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
