import RiddleFirstScanners from "./RiddleFirstScanners";
import TopUniqueScanners from "./TopUniqueScanners";

const LeaderboardBody = ({ refreshInterval }) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-3">
        <RiddleFirstScanners className="xl:col-span-1" refreshInterval={refreshInterval} />
        <TopUniqueScanners className="xl:col-span-2" refreshInterval={refreshInterval} />
      </div>
    </div>
  );
};

export default LeaderboardBody;
