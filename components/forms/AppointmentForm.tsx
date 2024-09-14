"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import CustomFormField from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { getAppointmentSchema } from "@/lib/validation"
import { useRouter } from "next/navigation"
import { Doctors } from "@/constants"
import { SelectItem } from "../ui/select"
import Image from "next/image"
import { FormFieldType } from "./PatientForm"
import { createAppointment, updateAppointment } from "@/lib/actions/appointment.actions"
import { Appointment } from "@/types/appwrite.types"

const AppointmentForm = ({ userId, patientId, type, appointment, setOpen }: { userId: string, patientId: string, type: "create" | "cancel" | "schedule", appointment: Appointment, setOpen: (open: boolean) => void }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const AppointmentFormValidation = getAppointmentSchema(type)

    const form = useForm<z.infer<typeof AppointmentFormValidation>>({
        resolver: zodResolver(AppointmentFormValidation),
        defaultValues: {
            primaryPhysician: appointment ? appointment.primaryPhysician : '',
            reason: appointment?.reason || '',
            note: appointment?.note || '',
            appointmentDate: appointment ? new Date(appointment.appointmentDate) : new Date(Date.now()),
            cancellationReason: appointment?.cancellationReason || ''
        },
    })

    async function onSubmit(values: z.infer<typeof AppointmentFormValidation>) {
        setIsLoading(true);

        let status;

        switch (type) {
            case "schedule":
                status = "scheduled";
                break;
            case "cancel":
                status = "cancelled";
                break;
            default:
                status = "pending";
        }

        try {

            if (type === 'create' && patientId) {
                const appointmentData = {
                    userId,
                    patient: patientId,
                    primaryPhysician: values.primaryPhysician,
                    appointmentDate: new Date(values.appointmentDate),
                    reason: values.reason!,
                    note: values.note!,
                    status: status as Status
                }

                const appointment = await createAppointment(appointmentData);

                if (appointment) {
                    form.reset();
                    router.push(`/patients/${userId}/new-appointment/success?appointmentId=${appointment.$id}`)
                }
            } else {
                const appointmentToUpdate = {
                    userId,
                    appointmentId: appointment?.$id,
                    appointment: {
                        primaryPhysician: values?.primaryPhysician,
                        appointmentDate: new Date(values.appointmentDate),
                        reason: values.reason,
                        cancellationReason: values.cancellationReason!,
                        status: status as Status
                    },
                    type
                }

                const updatedAppointment = await updateAppointment(appointmentToUpdate);

                if (updatedAppointment) {
                    setOpen && setOpen(false);
                    form.reset();
                }
            }

        } catch (error) {
            console.log(error);
        }
    }

    let buttonLabel;
    switch (type) {
        case 'cancel':
            buttonLabel = 'Cancel appointment'
            break;
        case 'create':
            buttonLabel = 'Create appointment'
            break;
        case 'schedule':
            buttonLabel = 'Schedule appointment'
            break;
        default: break;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex-1">

                {type === 'create' &&
                    <section className="mb-12 space-y-4">
                        <h1 className="header">Hey there 👋</h1>
                        <p className="text-dark-700">Schedule your appointment</p>
                    </section>
                }

                {type !== "cancel" && (
                    <>
                        <CustomFormField
                            fieldType={FormFieldType.SELECT}
                            control={form.control}
                            name="primaryPhysician"
                            label="Doctor"
                            placeholder="Select a Doctor">
                            {Doctors.map((doctor) => (
                                <SelectItem key={doctor.name} value={doctor.name}>
                                    <div className="flex cursor-pointer items-center gap-2">
                                        <Image
                                            src={doctor.image}
                                            alt={doctor.name}
                                            width={32}
                                            height={32}
                                            className="rounded-full border border-dark-500"
                                        />
                                        <p>{doctor.name}</p>
                                    </div>
                                </SelectItem>
                            ))}
                        </CustomFormField>
                        <div className="flex xl:flex-row gap-6 py-2">
                            <CustomFormField
                                fieldType={FormFieldType.TEXTAREA}
                                control={form.control}
                                name="reason"
                                label="Reason for appointment"
                                placeholder="ex: Annual monthly check-up"
                            />
                            <CustomFormField
                                fieldType={FormFieldType.TEXTAREA}
                                control={form.control}
                                name="note"
                                label="Additional notes"
                                placeholder="ex: Prefer afternoon appointments, if possible"
                            />
                        </div>
                        <CustomFormField
                            fieldType={FormFieldType.DATEPICKER}
                            control={form.control}
                            name="appointmentDate"
                            label="Expected appointment date"
                            showTimeSelect
                            dateFormat="MM/dd/yyyy - h:mm aa"
                        />
                    </>
                )}

                {type === "cancel" && (
                    <>
                        <CustomFormField
                            fieldType={FormFieldType.TEXTAREA}
                            control={form.control}
                            name="cancellationReason"
                            label="Reason for cancellation"
                            placeholder="Enter reason for cancellation"
                        />
                    </>
                )}


                <SubmitButton
                    isLoading={isLoading}
                    className={`${type === 'cancel' ? 'shad-danger-btn' : 'shad-primary-btn'} w-full`}
                >{buttonLabel}</SubmitButton>
            </form>
        </Form>
    )
}

export default AppointmentForm