(function (global) {
  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatINR(num) {
    return "₹" + Number(num || 0).toLocaleString("en-IN");
  }

  function formatLakhs(num) {
    const lakhs = Number(num || 0) / 100000;
    return `₹${lakhs.toFixed(1)}L`;
  }

  function evaluateProjectBudget(sanctioned, spent, workPct) {
    if (!sanctioned || sanctioned <= 0) {
      return { spendPct: 0, overSpend: false, projectedTotalCost: 0, projectedOverrunInr: 0, riskLevel: "Normal" };
    }
    const safeSpent = Math.max(0, Number(spent || 0));
    const safeWork = Math.min(100, Math.max(0, Number(workPct || 0)));
    const spendPct = Math.round((safeSpent / Number(sanctioned)) * 100);
    const variancePct = spendPct - safeWork;
    const projectedTotalCost = safeWork > 0 ? Math.round((safeSpent / safeWork) * 100) : safeSpent;
    const projectedOverrunInr = Math.max(0, projectedTotalCost - Number(sanctioned));
    const riskLevel = variancePct >= 15 ? "Critical" : variancePct > 0 ? "Warning" : "Normal";
    return { spendPct, overSpend: variancePct > 0, projectedTotalCost, projectedOverrunInr, riskLevel };
  }

  function sortGrievancesBySLA(items) {
    return [...items].sort((a, b) => {
      const aOpen = a.status !== "Resolved";
      const bOpen = b.status !== "Resolved";
      if (aOpen !== bOpen) return aOpen ? -1 : 1;
      if (aOpen && bOpen) return (a.slaHoursLeft ?? 48) - (b.slaHoursLeft ?? 48);
      return String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""));
    });
  }

  function computeResolutionRate(items) {
    if (!Array.isArray(items) || items.length === 0) return 0;
    const resolved = items.filter((g) => g.status === "Resolved").length;
    return Math.round((resolved / items.length) * 100);
  }

  global.GramaGlowLogic = {
    escapeHtml,
    formatINR,
    formatLakhs,
    evaluateProjectBudget,
    sortGrievancesBySLA,
    computeResolutionRate,
  };
})(window);
