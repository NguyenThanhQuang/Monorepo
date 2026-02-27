import { Grid, Paper, Typography } from "@mui/material";

interface VehicleStatsProps {
  stats: {
    total: number;
    active: number;
    maintenance: number;
    totalSeats: number;
  };
}

export default function VehicleStats({ stats }: VehicleStatsProps) {
  const Item = ({ label, value }: { label: string; value: number }) => (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5">{value}</Typography>
      <Typography>{label}</Typography>
    </Paper>
  );

  return (
    <Grid container spacing={2} mb={3}>
      <Grid size={3}>
        <Item label="Tổng số xe" value={stats.total} />
      </Grid>

      <Grid size={3}>
        <Item label="Đang hoạt động" value={stats.active} />
      </Grid>

      <Grid size={3}>
        <Item label="Bảo trì" value={stats.maintenance} />
      </Grid>

      <Grid size={3}>
        <Item label="Tổng số ghế" value={stats.totalSeats} />
      </Grid>
    </Grid>
  );
}
