"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl } from "@/components/ui/form"
import CustomFormField from "../CustomFormField"
import SubmitButton from "../SubmitButton"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerPatient } from "@/lib/actions/patient.actions"
import { FormFieldType } from "./PatientForm"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { Doctors, GenderOptions, IdentificationTypes, PatientFormDefaultValues } from "@/constants"
import { Label } from "../ui/label"
import { SelectItem } from "../ui/select"
import Image from "next/image"
import FileUploader from "../FileUploader"
import { PatientFormValidation } from "@/lib/validation"


const RegisterForm = ({ user }: { user: User }) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<z.infer<typeof PatientFormValidation>>({
        resolver: zodResolver(PatientFormValidation),
        defaultValues: {
            ...PatientFormDefaultValues,
            name: "",
            email: "",
            phone: ""
        },
    })

    async function onSubmit(values: z.infer<typeof PatientFormValidation>) {
        setIsLoading(true);

        let formData;

        if (values.identificationDocument && values.identificationDocument?.length > 0) {
            const blobFile = new Blob([values.identificationDocument[0]], {
                type: values.identificationDocument[0].type,
            })

            formData = new FormData();

            formData.append('blobFile', blobFile);
            formData.append('fileName', values.identificationDocument[0].name);
        }

        try {

            const patientData = {
                ...values,
                userId:user.$id,
                birthDate: new Date(values.birthDate),
                identificationDocument:formData
            }

            const patient = await registerPatient(patientData);

            if(patient) router.push(`/patients/${user.$id}/new-appointment`)

        } catch (error) {
            console.log(error);
        }
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex-1">
                <section className="mb-12 space-y-6">
                    <h1 className="header">Welcome 👋</h1>
                    <p className="text-dark-700">Let us know more about yourself</p>
                </section>
                <section className="mb-12 space-y-4">
                    <h2 className="sub-header">Personal Information</h2>
                    <div className="mb-9 py-2">
                        <CustomFormField
                            fieldType={FormFieldType.INPUT}
                            control={form.control}
                            name="name"
                            placeholder="John Doe"
                            iconSrc="/assets/icons/user.svg"
                            iconAlt="user"
                        />
                        <div className="flex flex-row gap-6 py-2">
                            <CustomFormField
                                fieldType={FormFieldType.INPUT}
                                control={form.control}
                                name="email"
                                label="Email Address"
                                placeholder="email@gmail.com"
                                iconSrc="/assets/icons/email.svg"
                                iconAlt="email"
                            />
                            <CustomFormField
                                fieldType={FormFieldType.PHONE_INPUT}
                                control={form.control}
                                name="phone"
                                label="Phone Number"
                                placeholder="999999999"
                            />
                        </div>
                        <div className="flex flex-row gap-6 py-2">
                            <CustomFormField
                                fieldType={FormFieldType.DATEPICKER}
                                control={form.control}
                                name="birthDate"
                                label="Date Of Birth"
                                placeholder="email@gmail.com"
                            />
                            <CustomFormField
                                fieldType={FormFieldType.SKELETON}
                                control={form.control}
                                name="gender"
                                label="Gender"
                                renderSkeleton={(field) => (
                                    <FormControl>
                                        <RadioGroup
                                            className="flex h-11 gap-6 xl:justify-between"
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}>
                                            {GenderOptions.map((option) => (
                                                <div key={option} className="radio-group">
                                                    <RadioGroupItem
                                                        value={option}
                                                        id={option}
                                                    />
                                                    <Label htmlFor={option} className="cursor-pointer">{option}</Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                )}
                            />
                        </div>
                        <div className="flex flex-row gap-6 py-2">
                            <CustomFormField
                                fieldType={FormFieldType.INPUT}
                                control={form.control}
                                name="address"
                                label="Address"
                                placeholder="ex: 14 street, New York, NY - 5101"
                            />
                            <CustomFormField
                                fieldType={FormFieldType.INPUT}
                                control={form.control}
                                name="occupation"
                                label="Occupation"
                                placeholder="Software Engineer"
                            />
                        </div>
                        <div className="flex flex-row gap-6 py-2">
                            <CustomFormField
                                fieldType={FormFieldType.INPUT}
                                control={form.control}
                                name="emergencyContactName"
                                label="Emergency Contact Name"
                                placeholder="Guardian’s name"
                            />
                            <CustomFormField
                                fieldType={FormFieldType.PHONE_INPUT}
                                control={form.control}
                                name="emergencyContactNumber"
                                label="Emergency Contact Phone"
                                placeholder="ex: +1 (868) 579-9831"
                            />
                        </div>
                    </div>
                </section>
                <section className="mb-12 space-y-4">
                    <h2 className="sub-header">Medical Information</h2>
                    <div className="mb-9 py-2">
                        <CustomFormField
                            fieldType={FormFieldType.SELECT}
                            control={form.control}
                            name="primaryPhysician"
                            label="Primary Physician"
                            placeholder="Select a physician">
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
                        <div className="flex flex-row gap-6 py-2">
                            <CustomFormField
                                fieldType={FormFieldType.INPUT}
                                control={form.control}
                                name="insuranceProvider"
                                label="Insurance provider"
                                placeholder="ex: BlueCross"
                            />
                            <CustomFormField
                                fieldType={FormFieldType.INPUT}
                                control={form.control}
                                name="insurancePolicyNumber"
                                label="Insurance policy number"
                                placeholder="ex: ABC1234567"
                            />
                        </div>
                        <div className="flex flex-row gap-6 py-2">
                            <CustomFormField
                                fieldType={FormFieldType.TEXTAREA}
                                control={form.control}
                                name="allergies"
                                label="Allergies (if any)"
                                placeholder="ex: Peanuts, Penicillin, Pollen"
                            />
                            <CustomFormField
                                fieldType={FormFieldType.TEXTAREA}
                                control={form.control}
                                name="currentMedication"
                                label="Current medications"
                                placeholder="ex: Ibuprofen 200mg, Levothyroxine 50mcg"
                            />
                        </div>
                        <div className="flex flex-row gap-6 py-2">
                            <CustomFormField
                                fieldType={FormFieldType.TEXTAREA}
                                control={form.control}
                                name="familyMedicalHistory"
                                label="Family medical history (if relevant)"
                                placeholder="ex: Mother had breast cancer"
                            />
                            <CustomFormField
                                fieldType={FormFieldType.TEXTAREA}
                                control={form.control}
                                name="pastMedicalHistory"
                                label="Past medical history"
                                placeholder="ex: Asthma diagnosis in childhood"
                            />
                        </div>
                    </div>
                </section>
                <section className="mb-12 space-y-4">
                    <h2 className="sub-header">Identification & Verification</h2>
                    <div className="mb-9 space-y-4">
                        <CustomFormField
                            fieldType={FormFieldType.SELECT}
                            control={form.control}
                            name="identificationType"
                            label="Identification Type"
                            placeholder="Select an identification type">
                            {IdentificationTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </CustomFormField>
                        <CustomFormField
                            fieldType={FormFieldType.INPUT}
                            control={form.control}
                            name="identificationNumber"
                            label="Identification Number"
                            placeholder="ex 1234567"
                        />
                        <CustomFormField
                            fieldType={FormFieldType.SKELETON}
                            control={form.control}
                            name="identificationDocument"
                            label="Scanned Copy of Identification Document"
                            renderSkeleton={(field: any) => (
                                <FormControl>
                                    <FileUploader files={field.value} onChange={field.onChange} />
                                </FormControl>
                            )}
                        />
                    </div>
                </section>
                <section className="mb-12 space-y-4">
                    <h2 className="sub-header">Consent & Privacy</h2>
                    <div className="mb-9 space-y-4">
                        <CustomFormField
                            fieldType={FormFieldType.CHECKBOX}
                            control={form.control}
                            name="treatmentConsent"
                            label="I consent to receive treatment for my health condition."
                        />
                        <CustomFormField
                            fieldType={FormFieldType.CHECKBOX}
                            control={form.control}
                            name="disclosureConsent"
                            label="I consent to the use and disclosure of my health information for treatment purposes."
                        />
                        <CustomFormField
                            fieldType={FormFieldType.CHECKBOX}
                            control={form.control}
                            name="privacyConsent"
                            label="I acknowledge that I have reviewed and agree to the privacy policy"
                        />
                    </div>
                </section>
                <SubmitButton isLoading={isLoading}>Submit and continue</SubmitButton>
            </form>
        </Form>
    )
}

export default RegisterForm