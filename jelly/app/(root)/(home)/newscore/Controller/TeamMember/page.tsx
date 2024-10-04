"use client"

import React from 'react'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import {
    Tabs,
  } from "@/components/ui/tabs"

  const TeamMember = () => {
    return (
  <Tabs defaultValue="week">
  <Card x-chunk="dashboard-05-chunk-3">
    <CardHeader className="px-7">
      <CardTitle>大濠高校</CardTitle>
      <CardDescription>
        Team ID 0000000000
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader className="text-lg">
          <TableRow>
            <TableHead>名前</TableHead>
            <TableHead className="hidden sm:table-cell">
              No
            </TableHead>
            <TableHead className="hidden sm:table-cell">
              GS
            </TableHead>
            <TableHead className="hidden md:table-cell">
              得点
            </TableHead>
            <TableHead className="text-right">
              ファール
              </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-white text-lg">
          <TableRow>
            <TableCell>
              <div className="font-medium">山田太郎</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              00
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              ⚫️
            </TableCell>
            <TableCell className="hidden md:table-cell">
              12
            </TableCell>
            <TableCell className="text-right">
              1
              </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <div className="font-medium">山田太郎</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              00
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              ⚫️
            </TableCell>
            <TableCell className="hidden md:table-cell">
              12
            </TableCell>
            <TableCell className="text-right">
              1
              </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <div className="font-medium">山田太郎</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              00
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              ⚫️
            </TableCell>
            <TableCell className="hidden md:table-cell">
              12
            </TableCell>
            <TableCell className="text-right">
              1
              </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <div className="font-medium">山田太郎</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              00
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              ⚫️
            </TableCell>
            <TableCell className="hidden md:table-cell">
              12
            </TableCell>
            <TableCell className="text-right">
              1
              </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <div className="font-medium">山田太郎</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              00
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              ⚫️
            </TableCell>
            <TableCell className="hidden md:table-cell">
              12
            </TableCell>
            <TableCell className="text-right">
              1
              </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <div className="font-medium">山田太郎</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              00
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              ⚫️
            </TableCell>
            <TableCell className="hidden md:table-cell">
              12
            </TableCell>
            <TableCell className="text-right">
              1
              </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <div className="font-medium">山田太郎</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              00
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              ⚫️
            </TableCell>
            <TableCell className="hidden md:table-cell">
              12
            </TableCell>
            <TableCell className="text-right">
              1
              </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <div className="font-medium">山田太郎</div>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              00
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              ⚫️
            </TableCell>
            <TableCell className="hidden md:table-cell">
              12
            </TableCell>
            <TableCell className="text-right">
              1
              </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</Tabs>
  );
}
export default TeamMember