"use client"

import React, { useState } from "react"
import ReactDOMServer from "react-dom/server"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable } from "./DataTable"
import { useToast } from "./ui/use-toast"
import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import ParticipantsEmail from "./email-template"
import { Input } from "./ui/input"

type Participant = {
  _id: string & {
    __tableName: "users"
  }
  _creationTime: number
  name?: string | undefined
  image?: any
  username?: string | undefined
  role?: string | undefined
  organization?: string | undefined
  bio?: string | undefined
  researchInterests?: string | undefined
  email?: string | undefined
  tokenIdentifier: string
} | null

export type Participants = Participant[]

const ParticipantsTable = ({
  participants,
  creatorEmail,
}: {
  participants: any | Participants
  creatorEmail: string | undefined
}) => {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [emailContent, setEmailContent] = useState("")
  const [emailSubject, setEmailSubject] = useState("")
  const { toast } = useToast()
  const emailHtml = ReactDOMServer.renderToStaticMarkup(
    <ParticipantsEmail subject={emailSubject} content={emailContent} />
  )

  function handleSubmit(e: any) {
    e.preventDefault()
    const postData = async () => {
      if (!emailContent.trim()) {
        toast({
          title: "Error",
          description: "Email content cannot be empty.",
          variant: "destructive",
        })
        return
      }

      const selectedParticipants = participants.filter(
        (participant: Participant) => selectedRows.includes(participant?._id!)
      )

      const emailAddresses = selectedParticipants
        .map((p: Participant) => p?.email)
        .filter(Boolean)

      if (emailAddresses.length === 0) {
        toast({
          title: "Error",
          description: "No valid email addresses selected.",
          variant: "destructive",
        })
        return
      }

      console.log("testintdasdasdasda")
      const response = await fetch("/api/send-emails", {
        method: "POST",
        body: JSON.stringify({
          to: emailAddresses,
          replyTo: creatorEmail,
          subject: emailSubject,
          text: emailContent,
          from: "onboarding@resend.dev", // TODO: change to verified email address later
        }),
      })
      return response.json()
    }
    postData().then((data) => {
      toast({
        title: "Success",
        description: "Emails sent successfully.",
      })
    })
  }

  const handleSelectAll = () => {
    if (selectedRows.length === participants?.length) {
      setSelectedRows([])
    } else {
      setSelectedRows(participants.map((p: Participant) => p?._id!))
    }
  }

  const handleSelectRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id))
    } else {
      setSelectedRows([...selectedRows, id])
    }
  }

  const columns: ColumnDef<Participant>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={selectedRows.length === participants.length}
          onCheckedChange={handleSelectAll}
        />
      ),
      cell: ({ row }) => {
        return (
          <Checkbox
            checked={selectedRows.includes(row.original?._id!)}
            onCheckedChange={() => {
              handleSelectRow(row.original?._id!)
            }}
          />
        )
      },
    },
    {
      id: "name",
      header: "Full Name",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center">
          <img
            className="h-10 w-10 rounded-full"
            src={row.original?.image}
            alt=""
          />
          <span className="ml-4">{row.original?.name}</span>
        </div>
      ),
    },
    { id: "username", header: "Username", accessorKey: "username" },
    { id: "email", header: "Email", accessorKey: "email" },
    { id: "organization", header: "Organization", accessorKey: "organization" },
    { id: "role", header: "Role", accessorKey: "role" },
    {
      id: "researchInterests",
      header: "Research Interests",
      accessorKey: "researchInterests",
    },
  ]

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Button
          type="button"
          onClick={() => setIsDialogOpen(true)}
          disabled={selectedRows.length === 0}
        >
          Send Email
        </Button>
      </div>
      <DataTable columns={columns} data={participants} />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Write your email to the participants</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter the subject here..."
            value={emailSubject}
            onChange={(e) => {
              setEmailSubject(e.target.value)
            }}
          />
          <Textarea
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            placeholder="Enter the email content..."
          />
          <div className="mt-4">
            <h3 className="font-bold">Preview:</h3>
            <div
              style={{
                border: "1px solid #dedede",
                padding: "16px",
                borderRadius: "5px",
                maxHeight: "300px",
                overflowY: "auto",
                marginTop: "12px",
                backgroundColor: "#ffffff",
              }}
              dangerouslySetInnerHTML={{ __html: emailHtml }} // Render the HTML
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            {/* <form > */}
            <Button
              type="submit"
              onClick={handleSubmit}
              // className="text-sm border border-gray-[#dfe4ed] rounded-md bg-black px-2 py-2 hover:bg-[#f0f3f8] hover:text-black text-white"
            >
              Confirm Send
            </Button>
            {/* </form> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ParticipantsTable
