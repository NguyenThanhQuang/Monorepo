import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import type { Vehicle } from "@obtp/shared-types";

export default function VehicleTable({
  vehicles,
  onEdit,
  onDelete,
}: any) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Biển số</TableCell>
          <TableCell>Loại</TableCell>
          <TableCell>Ghế</TableCell>
          {/* <TableCell>Hãng</TableCell> */}
          <TableCell>Trạng thái</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>

      <TableBody>
        {vehicles.map((v: Vehicle) => (
          <TableRow key={v._id}>
            <TableCell>{v.vehicleNumber}</TableCell>
            <TableCell>{v.type}</TableCell>
            <TableCell>{v.totalSeats}</TableCell>
            {/* <TableCell>{v.brand}</TableCell> */}
            <TableCell>{v.status}</TableCell>

            <TableCell>
              <IconButton onClick={() => onEdit(v)}>
                <EditIcon />
              </IconButton>

              <IconButton onClick={() => onDelete(v._id)}>
                <DeleteIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
