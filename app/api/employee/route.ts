import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const response = await db.employee.findMany();

  const shift = await db.shift.findMany();
  if (!response) {
    return new NextResponse("Internal error", { status: 500 });
  }

  shift.forEach((shift) => {
    response.forEach((employee) => {
      if (employee.shift === shift.id) {
        employee.shift = shift.name;
      }
    });
  });

  const formattedData = response.map((item) => ({
    id: item.id,
    name: item.name,
    contact_info: item.contact_info,
    role: item.role,
    shift: item.shift,
    sex: item.sex,
    salary: item.salary,
    picture: item.picture,
  }));

  return NextResponse.json(formattedData);
}

export async function POST(req: any) {
  const data = await req.json();
  const employeeData = {
    name: data.name,
    password: data.password,
    contact_info: data.contact_info,
    role: data.role,
    sex: data.sex,
    salary: Number(data.salary),
    picture: data.imageUrl,
  };

  const shift = await db.shift.findFirst({
    where: {
      name: data.shift,
    },
  });

  if (!shift) {
    console.log("Shift not found");
    return new NextResponse("Internal eroor", { status: 500 });
  }

  try {
    const response = await db.employee.create({
      data: {
        ...employeeData,
        shift: shift.id,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to create employee:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(request: any) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const attendance = await db.attendance.findFirst({
    where: {
      employee_id: id,
    },
  });

  if (attendance) {
    await db.attendance.deleteMany({
      where: {
        employee_id: id,
      },
    });
  }

  const employee = await db.employee.findFirst({
    where: {
      id: id,
    },
  });

  if (!employee) {
    return new NextResponse("Employee not found", { status: 404 });
  }

  try {
    await db.employee.delete({
      where: {
        id: id,
      },
    });

    return new NextResponse("Employee deleted", { status: 200 });
  } catch (error) {
    console.error("Failed to delete employee:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: any) {
  const data = await req.json();
  const employeeData = {
    name: data.name,
    password: data.password,
    contact_info: data.contact_info,
    role: data.role,
    salary: Number(data.salary),
    sex: data.sex,
  };

  const shift = await db.shift.findFirst({
    where: {
      name: data.shift,
    },
  });

  if (!shift) {
    console.log("Shift not found");
    return new NextResponse("Internal error", { status: 500 });
  }

  try {
    const response = await db.employee.update({
      where: {
        id: data.id,
      },
      data: {
        ...employeeData,
        shift: shift.id,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to update employee:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
