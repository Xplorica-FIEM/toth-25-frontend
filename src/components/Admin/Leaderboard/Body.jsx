import RiddleFirstScanners from "./RiddleFirstScanners";
import TopUniqueScanners from "./TopUniqueScanners";

const LeaderboardBody = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-3">
        <RiddleFirstScanners className="xl:col-span-1" />
        <TopUniqueScanners className="xl:col-span-2" />
      </div>
    </div>
  );
};

export default LeaderboardBody;
