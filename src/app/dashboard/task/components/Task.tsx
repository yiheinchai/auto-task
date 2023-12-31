import TableBodyRow from "@/app/components/TableBodyRow";
import TableBodyRowItem from "@/app/components/TableBodyRowItem";
import TaskList from "./TaskList";
import { tTask } from "../lib/types";
import Chip from "@/app/components/Chip";
import TaskActions from "./TaskActions";
import Link from "next/link";
import { STATUS_COLORS } from "../lib/consts";

export default function Task({ task }: { task: tTask }) {
  return (
    <>
      <TableBodyRow>
        <TableBodyRowItem widthPercentage={70}>
          <div className="group/task overflow-visible">
            <div className="truncate">
              <Link href={`/dashboard/task/${task.id}`} passHref>
                {task.name}
              </Link>
            </div>
            <div className="relative">
              <div className="invisible absolute group-hover/task:visible hover:delay-300 pt-2 text-inherit">
                <TaskActions task={task} />
              </div>
            </div>
          </div>
        </TableBodyRowItem>
        <TableBodyRowItem widthPercentage={15}>
          <Chip name={task.status || "TODO"} color={STATUS_COLORS[task.status || "TODO"]} />
        </TableBodyRowItem>
        <TableBodyRowItem widthPercentage={15}>{task.assignee}</TableBodyRowItem>
        {/* <TableBodyRowItem widthPercentage={45}>
          <TaskActions task={task} />
        </TableBodyRowItem> */}
      </TableBodyRow>

      {task.subtasks.length > 0 && (
        <TableBodyRow>
          <TableBodyRowItem stretch>
            <TaskList tasks={task.subtasks} withHeader={false} />
          </TableBodyRowItem>
        </TableBodyRow>
      )}
    </>
  );
}
